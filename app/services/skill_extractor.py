"""
Skill Extractor Service - Hybrid NLP pipeline for accurate skill extraction.
Uses Section Segmentation + Anchoring + strict confidence rules + Post-Processing.
"""
import re
import logging
from typing import List, Set, Dict, Tuple, Optional
from collections import defaultdict
from functools import lru_cache

import spacy
from spacy.tokens import Doc
import subprocess
import sys
from rapidfuzz import fuzz, process

from app.services.skill_taxonomy import SkillTaxonomy
from app.services.resume_segmenter import ResumeSegmenter, SectionType

logger = logging.getLogger(__name__)


class SkillExtractor:
    """
    Hybrid NLP pipeline for accurate skill extraction.
    
    Refined Pipeline (v2.2):
    1. SEGMENTATION: Split resume into Primary (Skills), Secondary (Exp), Tertiary (Edu/Summary)
    2. EXTRACTION: Find candidates in each section (with / splitting)
    3. SCORING: 
       - Multipliers based on section (Primary=2.0x, Secondary=1.0x)
       - Anchoring check for Secondary sections (must have context like "used", "stack")
       - Capped frequency bonus
    4. FILTERING: 
       - Strict Ratio matching (prevents substring matching)
       - Strict thresholds to reject noise
    5. POST-PROCESSING:
       - Split compound skills (Docker, CI/CD -> Docker + CI/CD)
       - Remove generic abstractions if specific ones exist (Cloud -> removed if AWS present)
       - Deduplicate
    """
    
    # Minimum fuzzy match score
    FUZZY_THRESHOLD = 90
    
    # Minimum word length for fuzzy matching
    MIN_FUZZY_LENGTH = 4
    
    # Maximum n-gram size
    MAX_NGRAM_SIZE = 4
    
    # Anchor words required for Secondary sections
    ANCHOR_WORDS = {
        "using", "used", "use", "with", "via", "through",
        "built", "building", "developed", "developing",
        "maintained", "managed", "deployed", "shipping",
        "stack", "technologies", "tools", "framework",
        "proficient", "experienced", "knowledge", "skills",
        "platform", "language", "library", "api"
    }
    
    # Denylist - words to explicitly ignore
    DENYLIST = {
        "advanced", "expert", "proficient", "experienced", "strong", 
        "knowledge", "understanding", "hands-on", "familiar", "various",
        "excellent", "good", "great", "basic", "intermediate", "senior",
        "junior", "lead", "principal", "manager", "management", "years",
        "time", "working", "work", "projects", "responsible", "duties",
        "role", "team", "member", "collaborated", "programming", "concepts",
        "frameworks", "libraries", "tools", "languages", "platforms", "solutions",
        "applications", "systems", "services", "version", "control", "analysis",
        "design", "development", "implementation", "testing", "deployment",
        "maintenance", "support", "documentation", "communication", "coordination",
        "environment", "methodologies", "practices", "principles", "patterns",
        # Generic abstractions (block if specific skills exist)
        "css", "cloud", "apis", "api", "database", "databases", "frontend", 
        "backend", "devops", "web", "mobile", "software", "engineering"
    }
    
    # Mapping: Generic term -> If ANY of these exist, remove the generic
    ABSTRACTION_RULES = {
        "cloud": {"aws", "azure", "gcp", "google cloud"},
        "css": {"tailwind css", "bootstrap", "sass", "scss"},
        "apis": {"rest apis", "grpc", "graphql", "websockets"},
        "api": {"rest apis", "grpc", "graphql", "websockets"},
        "database": {"postgresql", "mongodb", "mysql", "redis", "sql server"},
        "databases": {"postgresql", "mongodb", "mysql", "redis", "sql server"},
    }
    
    # Canonical skill names - maps variations to standard form
    CANONICAL_SKILLS = {
        # Version control
        "git": "Git",
        "github": "GitHub",
        "gitlab": "GitLab",
        "bitbucket": "Bitbucket",
        # JavaScript ecosystem
        "javascript": "JavaScript",
        "js": "JavaScript",
        "typescript": "TypeScript",
        "ts": "TypeScript",
        "node.js": "Node.js",
        "nodejs": "Node.js",
        "node": "Node.js",
        "react": "React",
        "reactjs": "React",
        "react.js": "React",
        "vue": "Vue.js",
        "vuejs": "Vue.js",
        "vue.js": "Vue.js",
        "angular": "Angular",
        "angularjs": "Angular",
        "express": "Express.js",
        "expressjs": "Express.js",
        "express.js": "Express.js",
        # Python ecosystem
        "python": "Python",
        "py": "Python",
        "fastapi": "FastAPI",
        "django": "Django",
        "flask": "Flask",
        # Databases
        "postgresql": "PostgreSQL",
        "postgres": "PostgreSQL",
        "mongodb": "MongoDB",
        "mongo": "MongoDB",
        "redis": "Redis",
        "mysql": "MySQL",
        # Cloud/DevOps
        "aws": "AWS",
        "amazon web services": "AWS",
        "azure": "Azure",
        "microsoft azure": "Azure",
        "gcp": "GCP",
        "google cloud": "GCP",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "k8s": "Kubernetes",
        "ci/cd": "CI/CD",
        "cicd": "CI/CD",
        # APIs
        "rest apis": "REST APIs",
        "rest api": "REST APIs",
        "restful": "REST APIs",
        "grpc": "gRPC",
        "graphql": "GraphQL",
        "websockets": "WebSockets",
        "websocket": "WebSockets",
        # Backend concepts
        "event-driven": "Event-Driven Systems",
        "event driven": "Event-Driven Systems",
        "authentication": "Authentication & Authorization",
        "authorization": "Authentication & Authorization",
        "auth": "Authentication & Authorization",
        "unit testing": "Unit Testing",
        "unit tests": "Unit Testing",
        "scalability": "Scalability",
        "data structures": "Data Structures",
        "algorithms": "Algorithms",
        "dsa": "Data Structures",
        # Languages
        "rust": "Rust",
        "c++": "C++",
        "cpp": "C++",
        "java": "Java",
        "go": "Go",
        "golang": "Go",
        # CSS
        "tailwind": "Tailwind CSS",
        "tailwind css": "Tailwind CSS",
        "tailwindcss": "Tailwind CSS",
    }
    
    def __init__(self, taxonomy: Optional[SkillTaxonomy] = None):
        self.taxonomy = taxonomy or SkillTaxonomy()
        self.segmenter = ResumeSegmenter()
        self._nlp = None
        self._load_spacy()
        logger.info(f"SkillExtractor v2.2 initialized with {self.taxonomy.skill_count} skills")
    
    def _load_spacy(self) -> None:
        model_name = "en_core_web_sm"
        try:
            self._nlp = spacy.load(model_name)
        except OSError:
            logger.info(f"SpaCy model '{model_name}' not found. Attempting to download...")
            try:
                subprocess.check_call([sys.executable, "-m", "spacy", "download", model_name])
                self._nlp = spacy.load(model_name)
                logger.info(f"Successfully downloaded and loaded '{model_name}'")
            except Exception as e:
                logger.error(f"Failed to download SpaCy model '{model_name}': {e}")
                # Fallback: create a very basic NLP-like thing if spacy fails completely
                # but for now, let it raise so we know why it failed
                raise

    def extract(self, text: str) -> List[str]:
        """
        Extract skills with section awareness, confidence validation, and post-processing.
        """
        if not text or not text.strip():
            return []
            
        # 1. Segment Text
        sections = self.segmenter.segment(text)
        
        # 2. Extract & Score Candidates
        skill_scores = defaultdict(float)
        skill_counts = defaultdict(int)
        
        for section_type, text_blocks in sections.items():
            for block in text_blocks:
                extracted = self._process_text_block(block, section_type)
                
                for skill, score in extracted:
                    skill_scores[skill] = max(skill_scores[skill], score)
                    skill_counts[skill] += 1
        
        # 3. Apply Scoring Rule
        raw_skills = set()
        
        for skill, count in skill_counts.items():
            base_section_score = skill_scores[skill]
            freq_bonus = min(0.4, 0.2 * count)
            total_score = base_section_score + freq_bonus
            
            is_high_conf = total_score >= 1.6
            is_repeated_valid = (count >= 2 and base_section_score >= 1.0) 
            
            if is_high_conf or is_repeated_valid:
                raw_skills.add(skill)

        # 4. Post-Processing: Split compounds, dedupe, remove abstractions, canonicalize
        final_skills = self._post_process(raw_skills)

        logger.info(f"Extracted {len(final_skills)} verified skills from {len(text)} chars")
        return final_skills

    def _post_process(self, skills: Set[str]) -> Set[str]:
        """
        Post-processing cleanup:
        1. Split compound skills (e.g., "Docker, CI/CD" -> "Docker", "CI/CD")
        2. Normalize slash-separated compounds (e.g., "Git/GitHub" -> "Git", "GitHub")
        3. Remove generic abstractions if specific skills exist
        4. Deduplicate (case-insensitive)
        """
        expanded = set()
        
        for skill in skills:
            # Split by comma
            if ', ' in skill:
                parts = [p.strip() for p in skill.split(',')]
                for part in parts:
                    if part and len(part) >= 2:
                        # Re-validate against taxonomy
                        canonical = self.taxonomy.normalize(part)
                        if canonical:
                            expanded.add(canonical)
                        elif self.taxonomy.is_known_skill(part):
                            expanded.add(part)
            # Split by slash (but preserve known compounds like CI/CD)
            elif '/' in skill and not self.taxonomy.is_known_skill(skill):
                parts = [p.strip() for p in skill.split('/')]
                for part in parts:
                    if part and len(part) >= 2:
                        canonical = self.taxonomy.normalize(part)
                        if canonical:
                            expanded.add(canonical)
                        elif self.taxonomy.is_known_skill(part):
                            expanded.add(part)
            else:
                expanded.add(skill)
        
        # Deduplicate case-insensitively (keep the cased version)
        seen_lower = {}
        deduped = set()
        for skill in expanded:
            lower = skill.lower()
            if lower not in seen_lower:
                seen_lower[lower] = skill
                deduped.add(skill)
        
        # Remove generic abstractions if specific skills present
        skills_lower = {s.lower() for s in deduped}
        to_remove = set()
        
        for generic, specifics in self.ABSTRACTION_RULES.items():
            if generic in skills_lower:
                if any(s in skills_lower for s in specifics):
                    # Find the original cased version to remove
                    for s in deduped:
                        if s.lower() == generic:
                            to_remove.add(s)
                            break
        
        return self._normalize_and_deduplicate(deduped - to_remove)

    def _normalize_and_deduplicate(self, skills: Set[str]) -> List[str]:
        """
        Final canonical normalization and deduplication.
        1. Split composite tokens on /, |, ,, &
        2. Map each to canonical name
        3. Deduplicate
        4. Return sorted, deterministic list
        """
        normalized = set()
        
        for skill in skills:
            # Split composite tokens
            parts = self._split_composite(skill)
            
            for part in parts:
                part_clean = part.strip()
                if len(part_clean) < 2:
                    continue
                    
                # Map to canonical name
                canonical = self._to_canonical(part_clean)
                if canonical:
                    normalized.add(canonical)
        
        # Return sorted for deterministic output
        return sorted(list(normalized))
    
    def _split_composite(self, skill: str) -> List[str]:
        """Split composite skill tokens on /, |, ,, &"""
        # Only preserve compounds that have a canonical single form (like CI/CD)
        # Other compound skills like Git/GitHub should be split
        if skill.lower() in self.CANONICAL_SKILLS:
            return [skill]
            
        # Split on delimiters
        parts = re.split(r'[/|,&]', skill)
        return [p.strip() for p in parts if p.strip()]
    
    def _to_canonical(self, skill: str) -> Optional[str]:
        """Map skill to its canonical form."""
        lower = skill.lower().strip()
        
        # Check canonical mapping first
        if lower in self.CANONICAL_SKILLS:
            return self.CANONICAL_SKILLS[lower]
        
        # Check taxonomy normalization
        canonical = self.taxonomy.normalize(skill)
        if canonical:
            return canonical
        
        # If in taxonomy as-is, use title case
        if self.taxonomy.is_known_skill(skill):
            return skill
            
        return None

    def _process_text_block(self, text: str, section_type: SectionType) -> List[Tuple[str, float]]:
        """Process a single text block and return scored candidates."""
        cleaned_text = self._preprocess(text)
        doc = self._nlp(cleaned_text)
        
        candidates = self._generate_candidates(doc)
        results = []
        
        multiplier = 2.0 if section_type == SectionType.PRIMARY else (1.0 if section_type == SectionType.SECONDARY else 0.5)
            
        for candidate, token_idx_start, token_idx_end in candidates:
            match_type, canonical = self._match(candidate)
            if not match_type:
                continue
                
            base_score = 1.0 if match_type == "EXACT" else 0.8
            
            if section_type == SectionType.SECONDARY:
                if not self._check_anchoring(doc, token_idx_start, token_idx_end):
                    continue
            
            final_score = base_score * multiplier
            results.append((canonical, final_score))
            
        return results

    def _generate_candidates(self, doc: Doc) -> List[Tuple[str, int, int]]:
        """Generate candidates with token indices for context checking."""
        candidates = []
        tokens = [t.text for t in doc]
        
        # 1. Single tokens
        for i, token in enumerate(doc):
            text = token.text
            if token.is_stop or token.is_punct:
                continue
            
            if len(text) >= 2:
                candidates.append((text, i, i+1))
                
            # Slash splitting for tokens like "Java/C++"
            if '/' in text:
                parts = text.split('/')
                for part in parts:
                    part = part.strip()
                    if len(part) >= 2:
                        candidates.append((part, i, i+1))
        
        # 2. Reconstruct slash-compounds (e.g., "CI", "/", "CD" -> "CI/CD")
        i = 0
        while i < len(tokens) - 2:
            if tokens[i+1] == '/':
                # Found pattern: TOKEN / TOKEN
                left = tokens[i]
                right = tokens[i+2]
                compound = f"{left}/{right}"
                candidates.append((compound, i, i+3))
                i += 3  # Skip past the compound
            else:
                i += 1
        
        # 3. N-grams (2-4 words)
        for n in range(2, self.MAX_NGRAM_SIZE + 1):
            for i in range(len(tokens) - n + 1):
                ngram = ' '.join(tokens[i:i+n])
                if len(ngram) >= 3:
                    candidates.append((ngram, i, i+n))
                    
        return candidates

    def _match(self, candidate: str) -> Tuple[Optional[str], Optional[str]]:
        """Match candidate against taxonomy and canonical mapping."""
        if candidate.lower() in self.DENYLIST:
            return None, None
        
        # 1. Check canonical mapping first (for backend concepts like WebSockets)
        if candidate.lower() in self.CANONICAL_SKILLS:
            return "EXACT", self.CANONICAL_SKILLS[candidate.lower()]
            
        # 2. Check taxonomy normalization
        canonical = self.taxonomy.normalize(candidate)
        if canonical:
            return "EXACT", canonical
            
        # 3. Fuzzy match against taxonomy
        if len(candidate) < self.MIN_FUZZY_LENGTH:
            return None, None
            
        try:
            result = process.extractOne(
                candidate,
                list(self.taxonomy.skills),
                scorer=fuzz.ratio,
                score_cutoff=self.FUZZY_THRESHOLD
            )
            if result:
                skill_name, score, _ = result
                return "FUZZY", skill_name
        except:
            pass
            
        return None, None

    def _check_anchoring(self, doc: Doc, start: int, end: int) -> bool:
        """Check if an anchor word exists within +- 5 tokens of the candidate."""
        window = 5
        context_start = max(0, start - window)
        context_end = min(len(doc), end + window)
        
        for i in range(context_start, context_end):
            if start <= i < end:
                continue
                
            token_text = doc[i].text.lower()
            if token_text in self.ANCHOR_WORDS:
                return True
                
            if doc[i].lemma_.lower() in self.ANCHOR_WORDS:
                return True
                
        return False

    def _preprocess(self, text: str) -> str:
        cleaned = re.sub(r'[^\w\s\.\#\+\-\/]', ' ', text)
        return re.sub(r'\s+', ' ', cleaned).strip()
    
    def get_skill_suggestions(self, partial: str, limit: int = 10):
        return self.taxonomy.search_similar(partial, limit=limit)

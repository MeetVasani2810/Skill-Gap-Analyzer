from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

import json
import logging
from fastapi.middleware.cors import CORSMiddleware

from app.services.analyzer import GapAnalyzer
from app.core.config import settings

# Configure logging to show application logs
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:%(name)s:%(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://skill-gap-analyzer-web.onrender.com",  # Your frontend URL
        "*"  # Or use this for testing (not recommended for production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Skill Gap Analyzer backend...")
    
    # Check Database
    if not analyzer.job_db.is_available():
        logger.warning("!!! CRITICAL: Job database (data/job_dataset.json) not found !!!")
        logger.warning("The analyzer will fail unless GROQ_API_KEY is provided for AI fallback.")
    
    # Check API Key
    if not settings.GROQ_API_KEY:
        logger.warning("!!! WARNING: GROQ_API_KEY is not set !!!")
        logger.warning("AI features like Learning Roadmaps and RAG Verification will be disabled.")
    
    if not analyzer.job_db.is_available() and not settings.GROQ_API_KEY:
        logger.error("!!! FATAL: Neither database nor API key available. Backend logic will fail. !!!")


# Initialize Analyzer (Loads models once)
analyzer = GapAnalyzer()


# Request Models
class RoleRequest(BaseModel):
    role: str
    experience_level: str = "Mid-Level"  # Default for backward compatibility


@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}


@app.post("/api/v1/generate-skills")
async def generate_skills(request: RoleRequest):
    """
    Generate skills for a role - database first, AI fallback
    """
    try:
        # Use database-first approach
        skills = analyzer.get_required_skills(request.role, request.experience_level)
        
        # Determine source
        source = "database" if analyzer.job_db.is_available() else "ai_generated"
        
        return {
            "skills": skills,
            "source": source,
            "count": len(skills)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/analyze")
async def analyze_gap(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    skills_list: Optional[str] = Form(None)  # JSON string input
):
    try:
        content = await resume.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Parse skills_list if provided
        parsed_skills = []
        if skills_list:
            try:
                parsed_skills = json.loads(skills_list)
            except:
                pass

        # Run Analysis
        result = analyzer.analyze(content, job_description, parsed_skills)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/extract-resume-data")
async def extract_resume_data(resume: UploadFile = File(...)):
    try:
        content = await resume.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # 1. Extract Text
        from app.services.parser import ParsingService
        text = ParsingService.extract_text_from_pdf(content)
        
        # 2. Extract Skills
        skills = analyzer.generator.extract_skills_from_text(text)
        
        return {
            "text": text,
            "skills": skills
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class AnalysisRequest(BaseModel):
    resume_skills: list[str]
    target_role: str
    experience_level: str = "Mid-Level"


@app.post("/api/v1/analyze-gap-lists")
async def analyze_gap_lists(request: AnalysisRequest):
    """
    Skill Gap Analysis - Three-Tier Hybrid Matching:
    1. Exact string matching (FREE, instant)
    2. Semantic similarity for near-matches (FREE, fast) 
    3. RAG verification for borderline cases (AI, accurate)
    """
    try:
        # 1. Get Target Skills for Role (Database-First!)
        target_skills = analyzer.get_required_skills(request.target_role, request.experience_level)
        
        logger.info(f"=== HYBRID MATCHING: {len(request.resume_skills)} resume vs {len(target_skills)} required ===")
        
        # 2. PHASE 1: Exact String Matching (Case-Insensitive)
        resume_lower = {s.lower().strip(): s for s in request.resume_skills}
        
        covered_skills = []
        missing_skills = []
        needs_semantic = []  # Skills that need semantic checking
        
        for target in target_skills:
            target_lower = target.lower().strip()
            if target_lower in resume_lower:
                covered_skills.append({
                    "skill": target,
                    "status": "covered",
                    "match_type": "exact",
                    "matched_with": resume_lower[target_lower]
                })
            else:
                needs_semantic.append(target)
        
        exact_matches = len(covered_skills)
        logger.info(f"Phase 1 - Exact matches: {exact_matches}")
        
        # 3. PHASE 2 & 3: Semantic + RAG for remaining skills
        if needs_semantic:
            # Encode all resume skills
            resume_embeddings = analyzer.embedder.encode(list(resume_lower.values()))
            
            # Create a lookup for quick matching
            resume_skills_list = list(resume_lower.values())
            
            borderline_cases = []
            
            for target in needs_semantic:
                # Get embedding for target skill
                target_emb = analyzer.embedder.encode([target])[0]
                
                # Calculate similarity with all resume skills
                from sklearn.metrics.pairwise import cosine_similarity
                import numpy as np
                
                similarities = cosine_similarity([target_emb], resume_embeddings)[0]
                best_idx = np.argmax(similarities)
                best_score = similarities[best_idx]
                best_match = resume_skills_list[best_idx]
                
                if best_score >= 0.7:
                    # HIGH CONFIDENCE: Semantic match
                    covered_skills.append({
                        "skill": target,
                        "status": "covered",
                        "match_type": "semantic",
                        "matched_with": best_match,
                        "confidence": round(float(best_score), 2)
                    })
                elif best_score >= 0.3:
                    # BORDERLINE: Needs RAG verification
                    borderline_cases.append((target, best_match, best_score))
                else:
                    # LOW: Definitely missing
                    missing_skills.append({
                        "skill": target,
                        "status": "missing"
                    })
            
            semantic_matches = len(covered_skills) - exact_matches
            logger.info(f"Phase 2 - Semantic matches: {semantic_matches}")
            
            # 4. PHASE 3: RAG Verification for borderline cases
            if borderline_cases:
                logger.info(f"Phase 3 - RAG verifying {len(borderline_cases)} borderline cases")
                
                for target, best_match, score in borderline_cases:
                    # Create context from ALL resume skills related to the target
                    context = f"Resume skills: {', '.join(request.resume_skills)}"
                    
                    verification = analyzer.rag_verifier.verify_skill(target, context, score)
                    
                    # RAG verifier returns "decision" not "is_covered"
                    if verification.get("decision") == "COVERED":
                        covered_skills.append({
                            "skill": target,
                            "status": "covered",
                            "match_type": "rag_verified",
                            "matched_with": best_match,
                            "confidence": verification.get("confidence", 0.7),
                            "reasoning": verification.get("reasoning", "AI verified")
                        })
                    else:
                        missing_skills.append({
                            "skill": target,
                            "status": "missing",
                            "reasoning": verification.get("reasoning", "Not found in resume")
                        })
        
        rag_verified = len([s for s in covered_skills if s.get("match_type") == "rag_verified"])
        logger.info(f"Phase 3 - RAG verified: {rag_verified}")
        logger.info(f"=== RESULT: {len(covered_skills)} covered, {len(missing_skills)} missing ===")
        
        # 5. Calculate Match Percentage
        total = len(target_skills)
        match_percentage = (len(covered_skills) / total * 100) if total > 0 else 0
        
        # 6. Generate Roadmap
        missing_names = [s['skill'] for s in missing_skills[:5]]
        roadmap = analyzer.generator.generate_roadmap(missing_names, request.target_role)
        
        return {
            "match_percentage": round(match_percentage, 1),
            "covered_skills": covered_skills,
            "missing_skills": missing_skills,
            "target_skills_full": target_skills,
            "roadmap": roadmap,
            "matching_stats": {
                "exact_matches": exact_matches,
                "semantic_matches": len(covered_skills) - exact_matches - rag_verified,
                "rag_verified": rag_verified,
                "missing": len(missing_skills)
            }
        }
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/generate-jd")
async def generate_jd(request: RoleRequest):
    try:
        jd_text = analyzer.generator.generate_job_description(request.role)
        return {"job_description": jd_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

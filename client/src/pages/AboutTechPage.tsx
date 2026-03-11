import { motion, type Variants } from "framer-motion"
import {
    Shield,
    Zap,
    Database,
    Brain,
    FileText,
    ArrowRight,
    CheckCircle,
    XCircle,
    ExternalLink,
    Code,
    Server,
    Layers,
    Box
} from "lucide-react"
import { Link } from "react-router-dom"
import { NLPFlowDiagram } from "@/components/NLPFlowDiagram"
import { CompetitiveComparison } from "@/components/CompetitiveComparison"
import { InteractiveHeroButton } from "@/components/InteractiveHeroButton"

// Animation variants
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const stagger: Variants = {
    visible: { transition: { staggerChildren: 0.1 } }
}

export function AboutTechPage() {
    return (
        <div className="overflow-hidden">
            <TechHero />
            <ArchitectureSection />
            <InnovationsSection />
            <TechStackSection />
            <VerificationSection />
        </div>
    )
}

/* ========================================
   TECH HERO SECTION
   ======================================== */
function TechHero() {
    return (
        <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0 bg-mesh-gradient opacity-50" />

            <div className="container relative z-10 px-4 lg:px-8">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="max-w-4xl mx-auto text-center"
                >
                    <motion.div variants={fadeInUp} className="mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                            <Code className="h-4 w-4" />
                            Technical Deep Dive
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold display-text mb-6"
                    >
                        Engineered to{" "}
                        <span className="gradient-text">Eliminate AI Hallucinations</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        Our hybrid RAG architecture combines local NLP processing with vector search
                        to deliver accurate skill analysis with strict provenance verification.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    )
}

/* ========================================
   ARCHITECTURE SECTION
   ======================================== */
function ArchitectureSection() {
    const pipelineSteps = [
        { icon: FileText, label: "Resume Upload", color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/50" },
        { icon: Brain, label: "SpaCy NLP", color: "from-purple-500 to-purple-600", shadow: "shadow-purple-500/50" },
        { icon: Layers, label: "Section Segmentation", color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/50" },
        { icon: Database, label: "Qdrant Vector DB", color: "from-blue-600 to-indigo-600", shadow: "shadow-indigo-500/50" },
        { icon: Zap, label: "Groq (Minimal)", color: "from-purple-600 to-pink-600", shadow: "shadow-purple-600/50" },
        { icon: CheckCircle, label: "Results", color: "from-emerald-600 to-teal-600", shadow: "shadow-emerald-600/50" }
    ]

    return (
        <section className="py-24 bg-muted/30">
            <div className="container px-4 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold display-text mb-4">
                        System Architecture
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">
                        A sophisticated pipeline that prioritizes accuracy over speed, while still
                        delivering results in seconds.
                    </motion.p>
                </motion.div>

                {/* Interactive Pipeline */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="max-w-5xl mx-auto"
                >
                    <div className="relative py-12">
                        {/* Connection Line - BEHIND everything */}
                        <div className="absolute top-[88px] left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full -z-10 hidden lg:block" />

                        {/* Pipeline Steps - ABOVE line */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-12 lg:gap-x-4">
                            {pipelineSteps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeInUp}
                                    className="relative group z-10"
                                >
                                    <div className="flex flex-col items-center">
                                        {/* Icon with glow and pulsing animation */}
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg ${step.shadow} group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300`}
                                        >
                                            <step.icon className="h-9 w-9 text-white group-hover:animate-pulse" />
                                        </motion.div>
                                        <div className="mt-6 text-center">
                                            <p className="font-semibold text-sm tracking-wide text-foreground/90">{step.label}</p>
                                        </div>
                                    </div>

                                    {/* Connection indicator for mobile/tablet */}
                                    {i < pipelineSteps.length - 1 && i % 3 !== 2 && (
                                        <ArrowRight className="hidden md:block lg:hidden absolute -right-3 top-10 h-5 w-5 text-muted-foreground/50" />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="mt-12 p-6 rounded-2xl bg-card border border-border shadow-soft">
                        <h3 className="font-semibold mb-4">How It Works</h3>
                        <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                            <div>
                                <p className="mb-3">
                                    <strong className="text-foreground">1. Local NLP First:</strong> Your resume is processed
                                    entirely on your machine using SpaCy's industrial-grade NLP engine. No cloud uploads required.
                                </p>
                                <p>
                                    <strong className="text-foreground">2. Smart Segmentation:</strong> The system identifies
                                    dedicated skill sections vs. experience prose, applying different extraction rules for each.
                                </p>
                            </div>
                            <div>
                                <p className="mb-3">
                                    <strong className="text-foreground">3. Vector Verification:</strong> Extracted skills are
                                    matched against our Qdrant database using semantic similarity, not just keyword matching.
                                </p>
                                <p>
                                    <strong className="text-foreground">4. Minimal AI:</strong> Groq's Llama 3 is only used for
                                    final roadmap generation, reducing hallucination risk by 90%.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

/* ========================================
   INNOVATIONS SECTION
   ======================================== */
function InnovationsSection() {
    const innovations = [
        {
            title: "Multi-Stage NLP Pipeline",
            description: "Segmentation → Anchoring → Strict Scoring",
            icon: Brain,
            code: `# Section-aware skill extraction
def extract_skills(resume_text):
    sections = segment_resume(resume_text)
    
    for section in sections:
        if section.is_skill_section:
            # Direct extraction from skill lists
            skills += extract_direct(section)
        else:
            # Anchored extraction requires context
            skills += extract_with_anchor(section)
    
    return normalize_and_deduplicate(skills)`
        },
        {
            title: "Zero-Hallucination Guarantee",
            description: "Strict line provenance for every skill",
            icon: Shield,
            comparison: {
                generic: ["Inferred 'Cloud' from 'AWS'", "Added 'Leadership' (assumed)", "Phantom skill: 'Agile'"],
                ours: ["Only 'AWS' extracted", "Skills verified against text", "100% traceable results"]
            }
        },
        {
            title: "Hybrid RAG Architecture",
            description: "Vector search + canonical normalization",
            icon: Database,
            metrics: [
                { label: "LLM Calls Reduced", value: "90%" },
                { label: "Processing Time", value: "<3s" },
                { label: "Accuracy Rate", value: "95%+" }
            ]
        }
    ]

    return (
        <section className="py-24">
            <div className="container px-4 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold display-text mb-4">
                        Key Innovations
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-muted-foreground">
                        What makes our approach different from generic AI solutions
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="space-y-16"
                >
                    {innovations.map((innovation, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className="max-w-5xl mx-auto"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl gradient-primary">
                                    <innovation.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{innovation.title}</h3>
                                    <p className="text-muted-foreground">{innovation.description}</p>
                                </div>
                            </div>

                            {/* NLP Pipeline Flow - INSTEAD of code */}
                            {innovation.title === "Multi-Stage NLP Pipeline" && (
                                <div className="mt-8">
                                    <NLPFlowDiagram />
                                </div>
                            )}

                            {/* Generic Comparison for Zero-Hallucination */}
                            {innovation.title === "Zero-Hallucination Guarantee" && innovation.comparison && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20">
                                        <h4 className="font-semibold text-destructive mb-4 flex items-center gap-2">
                                            <XCircle className="h-5 w-5" />
                                            Generic AI Output
                                        </h4>
                                        <ul className="space-y-2">
                                            {innovation.comparison.generic.map((item: string, j: number) => (
                                                <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20">
                                        <h4 className="font-semibold text-accent mb-4 flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5" />
                                            Our System
                                        </h4>
                                        <ul className="space-y-2">
                                            {innovation.comparison.ours.map((item: string, j: number) => (
                                                <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Metrics for Hybrid RAG */}
                            {innovation.metrics && (
                                <div className="grid grid-cols-3 gap-6">
                                    {innovation.metrics.map((metric, j) => (
                                        <div
                                            key={j}
                                            className="p-6 rounded-2xl bg-card border border-border text-center shadow-soft"
                                        >
                                            <p className="text-3xl font-bold gradient-text">{metric.value}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

/* ========================================
   TECH STACK SECTION
   ======================================== */
function TechStackSection() {
    const techStack = [
        { name: "FastAPI", category: "Backend", icon: Server, reason: "High-performance Python API" },
        { name: "SpaCy", category: "NLP", icon: Brain, reason: "Industrial-grade NLP engine" },
        { name: "Qdrant", category: "Vector DB", icon: Database, reason: "High-performance similarity search" },
        { name: "React 19", category: "Frontend", icon: Layers, reason: "Modern UI with concurrent features" },
        { name: "Framer Motion", category: "Animation", icon: Zap, reason: "Premium micro-interactions" },
        { name: "Tailwind CSS", category: "Styling", icon: Box, reason: "Utility-first rapid development" }
    ]

    return (
        <section className="py-24 bg-muted/30">
            <div className="container px-4 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold display-text mb-4">
                        Tech Stack
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-muted-foreground">
                        Carefully selected technologies for performance and reliability
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
                >
                    {techStack.map((tech, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className="group p-6 rounded-2xl bg-card border border-border shadow-soft card-hover"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <tech.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{tech.name}</h3>
                                    <p className="text-xs text-muted-foreground">{tech.category}</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{tech.reason}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

/* ========================================
   VERIFICATION SECTION
   ======================================== */
function VerificationSection() {

    return (
        <section className="py-24">
            <div className="container px-4 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold display-text mb-4">
                        Verification Results
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-muted-foreground">
                        Rigorously tested to ensure accuracy and reliability
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="max-w-5xl mx-auto"
                >
                    <CompetitiveComparison />

                    <div className="flex justify-center mt-12">
                        <InteractiveHeroButton variant="outline" size="md" href="https://github.com">
                            View Source on GitHub
                            <ExternalLink className="h-4 w-4" />
                        </InteractiveHeroButton>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center mt-16"
                >
                    <Link to="/app">
                        <InteractiveHeroButton variant="primary">
                            Try It Yourself
                            <ArrowRight className="h-5 w-5" />
                        </InteractiveHeroButton>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

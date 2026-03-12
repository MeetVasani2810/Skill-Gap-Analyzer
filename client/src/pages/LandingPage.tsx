import { motion, type Variants } from "framer-motion"
import { Link } from "react-router-dom"
import {
    Shield,
    Zap,
    Lock,
    Upload,
    Target,
    TrendingUp,
    GraduationCap,
    Briefcase,
    Users,
    BarChart3,
    Play,
    ArrowRight,
    Sparkles
} from "lucide-react"
import { InteractiveHeroButton } from "@/components/InteractiveHeroButton"
import { HeroAnimation } from "@/components/HeroAnimation"

// Animation variants
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const stagger: Variants = {
    visible: { transition: { staggerChildren: 0.15 } }
}

export function LandingPage() {
    return (
        <div className="overflow-hidden">
            <HeroSection />
            <InteractiveDemo />
            <WhyChooseUs />
            <HowItWorks />
            <TargetAudience />
        </div>
    )
}

/* ========================================
   HERO SECTION
   ======================================== */
function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center py-20 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-mesh-gradient" />

            {/* Floating Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary/10 blur-3xl"
                />
                <motion.div
                    animate={{ y: [20, -20, 20], rotate: [0, -10, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-secondary/10 blur-3xl"
                />
                <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl"
                />
            </div>

            <div className="container relative z-10 px-4 lg:px-8">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="max-w-4xl mx-auto text-center"
                >
                    {/* Badge */}
                    <motion.div variants={fadeInUp} className="mb-8">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                            <Sparkles className="h-4 w-4" />
                            AI-Powered Career Intelligence
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={fadeInUp}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold display-text mb-6"
                    >
                        Bridge Your Skill Gaps,{" "}
                        <span className="gradient-text">Land Your Dream Job</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance"
                    >
                        AI-powered resume analysis with zero hallucinations. Get personalized
                        learning roadmaps in seconds and close the gap between where you are
                        and where you want to be.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link to="/app">
                            <InteractiveHeroButton variant="primary">
                                Analyze My Resume
                                <ArrowRight className="h-5 w-5" />
                            </InteractiveHeroButton>
                        </Link>
                        <InteractiveHeroButton variant="outline" href="#demo">
                            <Play className="h-5 w-5" />
                            Try Live Demo
                        </InteractiveHeroButton>
                    </motion.div>


                    {/* Trust Indicators */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground"
                    >
                        <span className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-accent" />
                            Privacy-First
                        </span>
                        <span className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Instant Results
                        </span>
                        <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-secondary" />
                            Zero Cost
                        </span>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
                >
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </motion.div>
            </motion.div>
        </section>
    )
}

/* ========================================
   INTERACTIVE DEMO SECTION
   ======================================== */
function InteractiveDemo() {
    return (
        <section id="demo" className="py-24 bg-muted/30">
            <div className="container px-4 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={stagger}
                    className="text-center mb-12"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold display-text mb-4">
                        See It In Action
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">
                        Watch how our AI analyzes resumes, detects skill gaps, and generates personalized learning roadmaps.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="max-w-4xl mx-auto"
                >
                    <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-strong">
                        <HeroAnimation />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

/* ========================================
   WHY CHOOSE US SECTION
   ======================================== */
function WhyChooseUs() {
    const features = [
        {
            icon: Shield,
            title: "Zero Hallucinations",
            description: "Strict line provenance ensures every skill is verified against your actual resume. No phantom skills.",
            color: "primary"
        },
        {
            icon: Zap,
            title: "Lightning Fast",
            description: "90% less LLM dependency with instant local processing. Get results in seconds, not minutes.",
            color: "secondary"
        },
        {
            icon: Lock,
            title: "Privacy First",
            description: "Your resume stays on your machine. No cloud uploads, no data selling, complete ownership.",
            color: "accent"
        },
    ]

    return (
        <section className="py-24">
            <div className="container px-4 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold display-text mb-4">
                        Why Choose Us?
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">
                        Built different from day one. Our hybrid RAG architecture ensures
                        accuracy without compromising on speed or privacy.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className="group relative p-8 rounded-2xl bg-card border border-border card-hover card-glow"
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color === "primary" ? "bg-primary/10 text-primary" :
                                feature.color === "secondary" ? "bg-secondary/10 text-secondary" :
                                    "bg-accent/10 text-accent"
                                }`}>
                                <feature.icon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

/* ========================================
   HOW IT WORKS SECTION
   ======================================== */
function HowItWorks() {
    const steps = [
        { icon: Upload, title: "Upload Resume", description: "Drop your PDF or DOCX file" },
        { icon: Target, title: "Select Target Role", description: "Choose from 50+ job roles" },
        { icon: TrendingUp, title: "Get Roadmap", description: "Personalized learning path" },
    ]

    return (
        <section className="py-24 bg-muted/30">
            <div className="container px-4 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold display-text mb-4">
                        How It Works
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-muted-foreground">
                        Three simple steps to your personalized career roadmap
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 max-w-4xl mx-auto"
                >
                    {steps.map((step, i) => (
                        <motion.div key={i} variants={fadeInUp} className="flex items-center">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-medium">
                                        <step.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                </div>
                                <h3 className="font-semibold mt-4 mb-1">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>

                            {/* Connector Line */}
                            {i < steps.length - 1 && (
                                <div className="hidden md:block w-24 h-0.5 mx-4 bg-gradient-to-r from-primary to-secondary rounded-full" />
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

/* ========================================
   TARGET AUDIENCE SECTION
   ======================================== */
function TargetAudience() {
    const audiences = [
        {
            icon: GraduationCap,
            title: "Students",
            description: "Plan your learning journey and build the right skills for your first job.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: Briefcase,
            title: "Job Seekers",
            description: "Ace your next interview with a clear understanding of skill gaps.",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: Users,
            title: "Recruiters",
            description: "Screen candidates faster with objective skill assessments.",
            color: "from-orange-500 to-red-500"
        },
        {
            icon: BarChart3,
            title: "Career Coaches",
            description: "Provide data-driven guidance to your clients.",
            color: "from-green-500 to-emerald-500"
        },
    ]

    return (
        <section className="py-24">
            <div className="container px-4 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold display-text mb-4">
                        Built For Everyone
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">
                        Whether you&apos;re starting out or helping others succeed, we&apos;ve got you covered.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
                >
                    {audiences.map((audience, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className="relative group p-6 rounded-2xl bg-card border border-border card-hover overflow-hidden"
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${audience.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${audience.color} flex items-center justify-center mb-4`}>
                                <audience.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold mb-2">{audience.title}</h3>
                            <p className="text-sm text-muted-foreground">{audience.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Final CTA */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center mt-16"
                >
                    <Link to="/app">
                        <InteractiveHeroButton variant="primary">
                            Get Started Free
                            <ArrowRight className="h-5 w-5" />
                        </InteractiveHeroButton>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

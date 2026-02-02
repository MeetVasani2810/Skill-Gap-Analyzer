import { useLocation, Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { motion, type Variants } from "framer-motion"
import confetti from "canvas-confetti"
import {
    CheckCircle,
    XCircle,
    Target,
    Clock,
    TrendingUp,
    Download,
    RotateCcw,
    ChevronRight,
    ArrowRight
} from "lucide-react"
import type { AnalysisResultList } from "@/lib/api"
import { generateAnalysisPDF } from "@/lib/pdfGenerator"
import { SkillCategoryBreakdown, type CategoryData } from "@/components/SkillCategoryBreakdown"
import { RoadmapProgress } from "@/components/RoadmapProgress"

// Tab types
type TabType = "gap-analysis" | "comparison" | "roadmap" | "report"

// Animation variants
const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export function ResultsPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<TabType>("gap-analysis")

    // Get data from navigation state
    const { result, targetRole, experienceLevel } = (location.state || {}) as {
        result?: AnalysisResultList
        targetRole?: string
        experienceLevel?: string
    }

    // Show confetti on load
    useEffect(() => {
        if (result && result.match_percentage >= 70) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
        }
    }, [result])

    // Redirect if no data
    if (!result) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No Analysis Results</h2>
                    <p className="text-muted-foreground mb-6">Please upload a resume first to get your analysis.</p>
                    <Link
                        to="/app"
                        className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl gradient-primary"
                    >
                        Start Analysis
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        )
    }

    const tabs = [
        { id: "gap-analysis" as const, label: "Skill Gap Analysis" },
        { id: "comparison" as const, label: "Visual Comparison" },
        { id: "roadmap" as const, label: "Learning Roadmap" },
        { id: "report" as const, label: "Detailed Report" }
    ]

    // Calculate readiness time based on missing skills
    const readinessMonths = Math.ceil(result.missing_skills.length / 3)

    // Skill Categories Data setup
    const categoryData: CategoryData[] = [
        {
            category: "Frontend",
            your_count: 8,
            required: 10,
            percentage: 80,
            gap: 2
        },
        {
            category: "Backend",
            your_count: 6,
            required: 8,
            percentage: 75,
            gap: 2
        },
        {
            category: "DevOps",
            your_count: 4,
            required: 6,
            percentage: 66,
            gap: 2
        },
        {
            category: "Data",
            your_count: 5,
            required: 8,
            percentage: 62,
            gap: 3
        },
        {
            category: "Soft Skills",
            your_count: 9,
            required: 10,
            percentage: 90,
            gap: 1
        },
        {
            category: "Tools",
            your_count: 7,
            required: 8,
            percentage: 87,
            gap: 1
        }
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12">
            <div className="container px-4 lg:px-8">
                {/* Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold display-text mb-4">
                        Your <span className="gradient-text">Analysis Results</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Analysis for <span className="font-semibold text-foreground">{targetRole}</span> • {experienceLevel}
                    </p>
                </motion.div>

                {/* Overview Cards */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="grid md:grid-cols-3 gap-6 mb-8"
                >
                    {/* Match Score */}
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-soft gradient-border">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${result.match_percentage >= 70 ? "bg-accent/10 text-accent" :
                                result.match_percentage >= 50 ? "bg-yellow-500/10 text-yellow-600" :
                                    "bg-destructive/10 text-destructive"
                                }`}>
                                <Target className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Match Score</p>
                                <p className={`text-3xl font-bold ${result.match_percentage >= 70 ? "text-accent" :
                                    result.match_percentage >= 50 ? "text-yellow-600" :
                                        "text-destructive"
                                    }`}>
                                    {result.match_percentage}%
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${result.match_percentage}%` }}
                                transition={{ duration: 0.8 }}
                                className={`h-full rounded-full ${result.match_percentage >= 70 ? "bg-accent" :
                                    result.match_percentage >= 50 ? "bg-yellow-500" :
                                        "bg-destructive"
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Skills Summary */}
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Skills Overview</p>
                                <p className="text-xl font-bold">
                                    {result.covered_skills.length}/{result.covered_skills.length + result.missing_skills.length}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1 text-accent">
                                <CheckCircle className="h-4 w-4" /> {result.covered_skills.length} covered
                            </span>
                            <span className="flex items-center gap-1 text-destructive">
                                <XCircle className="h-4 w-4" /> {result.missing_skills.length} missing
                            </span>
                        </div>
                    </div>

                    {/* Time to Ready */}
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Time to Ready</p>
                                <p className="text-3xl font-bold text-secondary">~{readinessMonths} months</p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            With dedicated learning of 10-15 hours/week
                        </p>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="mb-6"
                >
                    <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-muted">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[140px] px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                                    ? "bg-card shadow-soft text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[400px]"
                >
                    {/* Skill Gap Analysis Tab */}
                    {activeTab === "gap-analysis" && (
                        <div className="grid lg:grid-cols-5 gap-6">
                            {/* Skills Lists */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Covered Skills */}
                                <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-accent">
                                        <CheckCircle className="h-5 w-5" />
                                        Your Skills ({result.covered_skills.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.covered_skills.map((item, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium"
                                            >
                                                {item.skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Missing Skills */}
                                <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-destructive">
                                        <XCircle className="h-5 w-5" />
                                        Missing Skills ({result.missing_skills.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missing_skills.map((item, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 rounded-full border border-destructive/30 text-destructive text-sm font-medium"
                                            >
                                                {item.skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Skill Category Breakdown */}
                            <div className="lg:col-span-3 p-6 rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
                                <h3 className="font-semibold mb-6 flex items-center justify-between">
                                    Skill Category Breakdown
                                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">Static Distribution</span>
                                </h3>
                                <SkillCategoryBreakdown data={categoryData} />
                            </div>
                        </div>
                    )}

                    {/* Visual Comparison Tab */}
                    {activeTab === "comparison" && (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Your Skills */}
                            <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-primary" />
                                    Your Resume Skills
                                </h3>
                                <div className="space-y-2">
                                    {result.covered_skills.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20"
                                        >
                                            <CheckCircle className="h-5 w-5 text-accent" />
                                            <span className="font-medium">{item.skill}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Job Requirements */}
                            <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-secondary" />
                                    Job Requirements
                                </h3>
                                <div className="space-y-2">
                                    {[...result.covered_skills, ...result.missing_skills].map((item, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-3 p-3 rounded-lg ${item.status === "covered"
                                                ? "bg-accent/5 border border-accent/20"
                                                : "bg-destructive/5 border border-destructive/20"
                                                }`}
                                        >
                                            {item.status === "covered" ? (
                                                <CheckCircle className="h-5 w-5 text-accent" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-destructive" />
                                            )}
                                            <span className="font-medium">{item.skill}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Learning Roadmap Tab */}
                    {activeTab === "roadmap" && (
                        <div className="max-w-3xl mx-auto">
                            <RoadmapProgress roadmapMarkdown={result.roadmap} />
                        </div>
                    )}

                    {/* Detailed Report Tab */}
                    {activeTab === "report" && (
                        <div className="max-w-3xl mx-auto">
                            {/* Download Card */}
                            <div className="mb-6 p-6 rounded-2xl gradient-primary text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg">Download Full Report</h3>
                                        <p className="text-white/80 text-sm">Get a PDF summary of your analysis</p>
                                    </div>
                                    <button
                                        onClick={() => generateAnalysisPDF(result, targetRole || 'Unknown Role', experienceLevel || 'Unknown Level')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                                    >
                                        <Download className="h-5 w-5" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>

                            {/* Interactive Roadmap */}
                            <RoadmapProgress roadmapMarkdown={result.roadmap} />
                        </div>
                    )}
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="flex justify-center gap-4 mt-12"
                >
                    <button
                        onClick={() => navigate("/app")}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
                    >
                        <RotateCcw className="h-5 w-5" />
                        Analyze Another Role
                    </button>
                    <Link
                        to="/about"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                    >
                        Learn About Our Tech
                        <ChevronRight className="h-5 w-5" />
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}

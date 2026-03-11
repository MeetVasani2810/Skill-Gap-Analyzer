import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone } from "react-dropzone"
import {
    Upload,
    FileText,
    X,
    ChevronRight,
    ChevronLeft,
    Search,
    Loader2,
    CheckCircle,
    Sparkles
} from "lucide-react"
import { extractResumeData, analyzeGapLists } from "@/lib/api"
import { InteractiveHeroButton } from "@/components/InteractiveHeroButton"

// Common roles for dropdown
const TARGET_ROLES = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "Cloud Architect",
    "Product Manager",
    "UI/UX Designer",
    "Mobile Developer",
    "QA Engineer",
    "Security Engineer",
    "Blockchain Developer",
    "Game Developer",
    "Systems Administrator",
    "Database Administrator",
    "Technical Writer",
    "Scrum Master"
]

const EXPERIENCE_LEVELS = ["Entry Level", "Mid-Level", "Senior", "Lead/Principal"]

export function AppPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)

    // Step 1: Upload
    const [file, setFile] = useState<File | null>(null)
    const [extractedSkills, setExtractedSkills] = useState<string[]>([])
    const [isExtracting, setIsExtracting] = useState(false)

    // Step 2: Role Selection
    const [targetRole, setTargetRole] = useState("")
    const [experienceLevel, setExperienceLevel] = useState("Mid-Level")
    const [jobDescription, setJobDescription] = useState("")
    const [roleSearch, setRoleSearch] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisProgress, setAnalysisProgress] = useState(0)
    const [loadingText, setLoadingText] = useState("")

    // File drop handler
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const uploadedFile = acceptedFiles[0]
            setFile(uploadedFile)
            setIsExtracting(true)

            try {
                const data = await extractResumeData(uploadedFile)
                setExtractedSkills(data.skills)
                setStep(2)
            } catch (error) {
                console.error("Error extracting resume data:", error)
                // Still allow proceeding without extracted skills
                setStep(2)
            } finally {
                setIsExtracting(false)
            }
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1
    })

    // Analysis handler
    const handleAnalyze = async () => {
        if (!targetRole) return

        setIsAnalyzing(true)
        setAnalysisProgress(0)

        const loadingMessages = [
            "Extracting skills from resume...",
            "Matching against job requirements...",
            "Analyzing skill gaps...",
            "Building personalized roadmap...",
            "Finalizing results..."
        ]

        let messageIndex = 0
        const interval = setInterval(() => {
            setLoadingText(loadingMessages[messageIndex])
            setAnalysisProgress((prev) => Math.min(prev + 20, 90))
            messageIndex = (messageIndex + 1) % loadingMessages.length
        }, 800)

        try {
            const result = await analyzeGapLists(extractedSkills, targetRole, experienceLevel)
            clearInterval(interval)
            setAnalysisProgress(100)

            // Navigate to results with data
            navigate("/results", { state: { result, targetRole, experienceLevel } })
        } catch (error) {
            console.error("Analysis failed:", error)
            clearInterval(interval)
            setIsAnalyzing(false)
        }
    }

    const filteredRoles = TARGET_ROLES.filter(role =>
        role.toLowerCase().includes(roleSearch.toLowerCase())
    )

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12">
            <div className="container px-4 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold display-text mb-4">
                        Analyze Your <span className="gradient-text">Skills</span>
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Upload your resume and select a target role to get your personalized skill gap analysis.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="flex items-center justify-center gap-4">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${step >= s
                                    ? "gradient-primary text-white"
                                    : "bg-muted text-muted-foreground"
                                    }`}>
                                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                                </div>
                                {s < 2 && (
                                    <div className={`w-20 h-1 mx-2 rounded-full transition-all ${step > s ? "gradient-primary" : "bg-muted"
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span className="text-center flex-1">Upload Resume</span>
                        <span className="text-center flex-1">Select Role & Analyze</span>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Upload */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div
                                    {...getRootProps()}
                                    className={`relative p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${isDragActive
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                                        }`}
                                >
                                    <input {...getInputProps()} />

                                    {isExtracting ? (
                                        <div className="text-center">
                                            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
                                            <p className="text-lg font-medium">Extracting skills from your resume...</p>
                                            <p className="text-muted-foreground mt-2">This may take a few seconds</p>
                                        </div>
                                    ) : file ? (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-4 mb-4">
                                                <FileText className="h-12 w-12 text-primary" />
                                                <div className="text-left">
                                                    <p className="font-medium">{file.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setFile(null)
                                                    }}
                                                    className="p-2 rounded-full hover:bg-destructive/10 text-destructive"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                                                <Upload className="h-10 w-10 text-white" />
                                            </div>
                                            <p className="text-lg font-medium mb-2">
                                                {isDragActive ? "Drop your resume here" : "Drop your resume here or click to browse"}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Supports PDF and DOCX files
                                            </p>
                                            <div className="flex justify-center gap-4 mt-4">
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm">
                                                    <FileText className="h-4 w-4" /> PDF
                                                </span>
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm">
                                                    <FileText className="h-4 w-4" /> DOCX
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Role Selection & Analyze */}
                        {step === 2 && !isAnalyzing && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* File info */}
                                {file && (
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                                        <FileText className="h-8 w-8 text-primary" />
                                        <div className="flex-1">
                                            <p className="font-medium">{file.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {extractedSkills.length} skills extracted
                                            </p>
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-accent" />
                                    </div>
                                )}

                                {/* Role Selection */}
                                <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                        Target Role *
                                    </label>
                                    <div className="relative mb-4">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={roleSearch}
                                            onChange={(e) => setRoleSearch(e.target.value)}
                                            placeholder="Search roles..."
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                        {filteredRoles.map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => setTargetRole(role)}
                                                className={`p-3 rounded-lg border text-left text-sm transition-all ${targetRole === role
                                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                                    : "border-border hover:border-primary/50"
                                                    }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Experience Level */}
                                <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                        Experience Level
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {EXPERIENCE_LEVELS.map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setExperienceLevel(level)}
                                                className={`p-3 rounded-lg border text-center text-sm transition-all ${experienceLevel === level
                                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                                    : "border-border hover:border-primary/50"
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Job Description (Optional) */}
                                <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                        Job Description (Optional)
                                    </label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste a specific job description for more accurate analysis..."
                                        rows={4}
                                        className="w-full p-4 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <InteractiveHeroButton variant="outline" size="md" onClick={() => setStep(1)}>
                                        <ChevronLeft className="h-5 w-5" />
                                        Back
                                    </InteractiveHeroButton>
                                    <div className="flex-1">
                                        <InteractiveHeroButton
                                            variant="primary"
                                            size="md"
                                            fullWidth
                                            onClick={handleAnalyze}
                                            disabled={!targetRole}
                                        >
                                            <Sparkles className="h-5 w-5" />
                                            Analyze Skills
                                            <ChevronRight className="h-5 w-5" />
                                        </InteractiveHeroButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Loading State */}
                        {isAnalyzing && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-20 text-center"
                            >
                                <div className="relative mx-auto w-32 h-32 mb-8">
                                    <div className="absolute inset-0 rounded-full gradient-primary opacity-20 animate-ping" />
                                    <div className="relative w-full h-full rounded-full gradient-primary flex items-center justify-center">
                                        <Loader2 className="h-12 w-12 text-white animate-spin" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold mb-2 gradient-text">{loadingText}</h2>
                                <p className="text-muted-foreground mb-8">
                                    Analyzing your profile against {targetRole} requirements
                                </p>

                                <div className="max-w-md mx-auto">
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${analysisProgress}%` }}
                                            className="h-full gradient-primary"
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">{analysisProgress}% complete</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

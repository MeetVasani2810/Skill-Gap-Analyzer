import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    CheckCircle2,
    Circle,
    ChevronRight,
    ChevronLeft,
    Clock,
    BookOpen,
    ExternalLink,
    Sparkles,
    Trophy
} from "lucide-react"

interface RoadmapStep {
    id: number
    title: string
    content: string
    timeEstimate?: string
}

interface RoadmapProgressProps {
    roadmapMarkdown: string
    storageKey?: string
}

// Parse markdown roadmap into structured steps
function parseRoadmap(markdown: string): RoadmapStep[] {
    if (!markdown) return []

    const steps: RoadmapStep[] = []

    // Split by skill headers (#### 1., ### 1., **1., or just numbered patterns)
    const skillPattern = /(?:^|\n)(?:#{1,4}\s*)?(?:\*\*)?(\d+)\.\s*(.+?)(?:\*\*)?\s*\n([\s\S]*?)(?=(?:\n(?:#{1,4}\s*)?(?:\*\*)?\d+\.|$))/gi

    let match
    while ((match = skillPattern.exec(markdown)) !== null) {
        const skillNumber = parseInt(match[1])
        const title = match[2].trim().replace(/\*\*/g, '')
        const content = match[3].trim()

        // Try to extract time estimate from content
        const timeMatch = content.match(/(?:time|duration|hours?|weeks?|days?):\s*([^.\n]+)/i) ||
            content.match(/(\d+[-–]\d+\s*(?:hours?|weeks?|days?))/i) ||
            content.match(/approximately\s+(\d+\s*(?:hours?|weeks?|days?))/i)

        steps.push({
            id: skillNumber,
            title,
            content,
            timeEstimate: timeMatch ? timeMatch[1].trim() : undefined
        })
    }

    // If pattern didn't work, try simpler line-by-line parsing
    if (steps.length === 0) {
        const lines = markdown.split('\n')
        let currentStep: Partial<RoadmapStep> | null = null
        let stepId = 1

        for (const line of lines) {
            const headerMatch = line.match(/^(?:#{1,4}\s*)?(?:\*\*)?(\d+)\.\s*(.+?)(?:\*\*)?$/)
            if (headerMatch) {
                if (currentStep && currentStep.title) {
                    steps.push(currentStep as RoadmapStep)
                }
                currentStep = {
                    id: stepId++,
                    title: headerMatch[2].replace(/\*\*/g, '').trim(),
                    content: ''
                }
            } else if (currentStep) {
                currentStep.content = (currentStep.content || '') + line + '\n'
            }
        }

        if (currentStep && currentStep.title) {
            steps.push(currentStep as RoadmapStep)
        }
    }

    return steps
}

// Clean markdown formatting from text
function cleanMarkdown(text: string): string {
    return text
        // Remove bold/italic markers
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        // Remove headers
        .replace(/^#{1,6}\s*/gm, '')
        // Remove inline code backticks
        .replace(/`([^`]+)`/g, '$1')
        // Clean up extra whitespace
        .trim()
}

// Generate a simple hash for the roadmap to use as storage key
function hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return 'roadmap_' + Math.abs(hash).toString(36)
}

export function RoadmapProgress({ roadmapMarkdown, storageKey }: RoadmapProgressProps) {
    const steps = useMemo(() => parseRoadmap(roadmapMarkdown), [roadmapMarkdown])
    const key = storageKey || hashString(roadmapMarkdown)

    // Load completed steps from localStorage
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
        try {
            const saved = localStorage.getItem(key)
            if (saved) {
                return new Set(JSON.parse(saved))
            }
        } catch (e) {
            console.error('Failed to load progress:', e)
        }
        return new Set()
    })

    const [currentStep, setCurrentStep] = useState(0)

    // Save progress to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify([...completedSteps]))
        } catch (e) {
            console.error('Failed to save progress:', e)
        }
    }, [completedSteps, key])

    // Toggle step completion
    const toggleStep = (stepId: number) => {
        setCompletedSteps(prev => {
            const next = new Set(prev)
            if (next.has(stepId)) {
                next.delete(stepId)
            } else {
                next.add(stepId)
            }
            return next
        })
    }

    // Navigate to next incomplete step
    const goToNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const goToPrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    // Calculate progress
    const progress = steps.length > 0
        ? Math.round((completedSteps.size / steps.length) * 100)
        : 0

    const allComplete = steps.length > 0 && completedSteps.size === steps.length

    if (steps.length === 0) {
        // Fallback: render markdown as formatted text if parsing fails
        return (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Personalized Learning Roadmap
                </h3>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {roadmapMarkdown}
                </div>
            </div>
        )
    }

    const currentStepData = steps[currentStep]

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Your Learning Journey</h3>
                            <p className="text-sm text-muted-foreground">
                                {completedSteps.size} of {steps.length} skills completed
                            </p>
                        </div>
                    </div>
                    {allComplete && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent"
                        >
                            <Trophy className="h-4 w-4" />
                            <span className="text-sm font-medium">Complete!</span>
                        </motion.div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-medium text-foreground">{progress}%</span>
                </div>

                {/* Step Indicators */}
                <div className="flex gap-1.5 mt-4 justify-center flex-wrap">
                    {steps.map((step, idx) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(idx)}
                            className={`relative w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${idx === currentStep
                                ? 'bg-primary text-white shadow-md scale-110'
                                : completedSteps.has(step.id)
                                    ? 'bg-accent/20 text-accent'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {completedSteps.has(step.id) ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                idx + 1
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Current Step Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 rounded-2xl bg-card border border-border shadow-soft"
                >
                    {/* Step Header */}
                    <div className="flex items-start gap-4 mb-4">
                        <button
                            onClick={() => toggleStep(currentStepData.id)}
                            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${completedSteps.has(currentStepData.id)
                                ? 'bg-accent text-white'
                                : 'bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary'
                                }`}
                        >
                            {completedSteps.has(currentStepData.id) ? (
                                <CheckCircle2 className="h-5 w-5" />
                            ) : (
                                <Circle className="h-5 w-5" />
                            )}
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    Step {currentStep + 1} of {steps.length}
                                </span>
                                {currentStepData.timeEstimate && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {currentStepData.timeEstimate}
                                    </span>
                                )}
                            </div>
                            <h4 className="text-lg font-semibold">{currentStepData.title}</h4>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="pl-14 space-y-4">
                        <div className="prose prose-sm max-w-none text-muted-foreground">
                            {currentStepData.content.split('\n').map((line, i) => {
                                const trimmedLine = line.trim()
                                if (!trimmedLine) return null

                                // Clean markdown from the line
                                const cleanedLine = cleanMarkdown(trimmedLine)

                                // Check if line contains a link pattern
                                const linkMatch = trimmedLine.match(/\[(.+?)\]\((.+?)\)/)
                                if (linkMatch) {
                                    return (
                                        <p key={i} className="flex items-start gap-2">
                                            <ExternalLink className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                                            <a
                                                href={linkMatch[2]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {cleanMarkdown(linkMatch[1])}
                                            </a>
                                        </p>
                                    )
                                }

                                // Check for bullet points (-, *, or •)
                                if (trimmedLine.match(/^[-*•]\s/)) {
                                    return (
                                        <p key={i} className="flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            <span>{cleanMarkdown(trimmedLine.replace(/^[-*•]\s*/, ''))}</span>
                                        </p>
                                    )
                                }

                                return <p key={i}>{cleanedLine}</p>
                            })}
                        </div>

                        {/* Mark Complete Button */}
                        <button
                            onClick={() => toggleStep(currentStepData.id)}
                            className={`w-full py-3 rounded-xl font-medium transition-all ${completedSteps.has(currentStepData.id)
                                ? 'bg-accent/10 text-accent hover:bg-accent/20'
                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                        >
                            {completedSteps.has(currentStepData.id) ? (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Completed! Click to undo
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Circle className="h-5 w-5" />
                                    Mark as Complete
                                </span>
                            )}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={goToPrev}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${currentStep === 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                        }`}
                >
                    <ChevronLeft className="h-5 w-5" />
                    Previous
                </button>

                <button
                    onClick={goToNext}
                    disabled={currentStep === steps.length - 1}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${currentStep === steps.length - 1
                        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                        : 'gradient-primary text-white shadow-md hover:shadow-lg'
                        }`}
                >
                    Next
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Quick Overview - All Steps */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    All Skills Overview
                </h4>
                <div className="space-y-2">
                    {steps.map((step, idx) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(idx)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${idx === currentStep
                                ? 'bg-primary/10 border border-primary/20'
                                : 'bg-muted/50 hover:bg-muted'
                                }`}
                        >
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${completedSteps.has(step.id)
                                ? 'bg-accent text-white'
                                : 'bg-muted-foreground/20 text-muted-foreground'
                                }`}>
                                {completedSteps.has(step.id) ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <span className="text-xs font-medium">{idx + 1}</span>
                                )}
                            </div>
                            <span className={`font-medium ${completedSteps.has(step.id) ? 'text-accent line-through' : ''
                                }`}>
                                {step.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

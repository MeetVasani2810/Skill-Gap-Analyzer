import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, AlertTriangle, BookOpen } from "lucide-react"
import "./HeroAnimation.css"

const STEP_LABELS = [
  "Resume Upload",
  "AI Scanning",
  "Skill Extraction",
  "Skill Comparison",
  "Gap Detection",
  "AI Roadmap",
]

// Each step's display duration (ms) — tuned so the internal animations
// finish comfortably before the step transitions out.
const STEP_DURATIONS = [2800, 3000, 2800, 3200, 2800, 3400]

const TOTAL_STEPS = STEP_LABELS.length

/* ────────────────── PARTICLE CANVAS ────────────────── */
function ParticleCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; r: number; a: number }[]>([])
  const rafRef = useRef<number>(0)
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    particles.current = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 0.5,
      a: Math.random() * 0.4 + 0.15,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      if (activeRef.current) {
        for (const p of particles.current) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(99, 102, 241, ${p.a})`
          ctx.fill()
        }
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, []) // run once — active tracked via ref

  return <canvas ref={canvasRef} className="hero-anim-particles" />
}

/* ────────────────── STEP 1: RESUME UPLOAD ────────────────── */
function Step1Upload() {
  const [dropped, setDropped] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDropped(true), 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="hero-stage">
      <motion.div
        className="pdf-icon"
        initial={{ x: -100, y: -70, opacity: 0, rotate: -15 }}
        animate={
          dropped
            ? { x: 0, y: 0, opacity: 1, rotate: 0 }
            : { x: -100, y: -70, opacity: 1, rotate: -15 }
        }
        transition={{ type: "spring", stiffness: 100, damping: 13, delay: 0.15 }}
      >
        <FileText size={24} />
      </motion.div>

      <div className={`upload-zone ${dropped ? "upload-zone--active" : ""}`}>
        {!dropped ? (
          <span className="upload-zone-text">Drag resume here</span>
        ) : (
          <motion.span
            className="upload-success"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 180 }}
          >
            Resume Uploaded ✔
          </motion.span>
        )}
      </div>
    </div>
  )
}

/* ────────────────── STEP 2: AI SCANNING ────────────────── */
function Step2Scanning() {
  return (
    <div className="hero-stage">
      <div className="resume-card resume-card--wide">
        <div className="scan-line" />
        <div className="resume-card-lines">
          <div className="resume-line" />
          <div className="resume-line" />
          <div className="resume-line" />
          <div className="resume-line" />
          <div className="resume-line" />
          <div className="resume-line" />
        </div>
      </div>
      <motion.p
        className="hero-stage-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        AI is reading your resume…
      </motion.p>
    </div>
  )
}

/* ────────────────── STEP 3: SKILL EXTRACTION ────────────────── */
function Step3Extraction() {
  const skills = ["Python", "React", "Docker", "Git"]
  return (
    <div className="hero-stage">
      <div className="resume-card resume-card--mini">
        <div className="resume-card-lines">
          <div className="resume-line" />
          <div className="resume-line" />
          <div className="resume-line" />
        </div>
      </div>

      <div className="skill-tags skill-tags--spread">
        {skills.map((s, i) => (
          <motion.span
            key={s}
            className="skill-tag"
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.3, type: "spring", stiffness: 170, damping: 12 }}
          >
            {s}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

/* ────────────────── STEP 4: SKILL COMPARISON ────────────────── */
function Step4Comparison() {
  const yourSkills = [
    { name: "Python", match: true },
    { name: "React", match: true },
    { name: "Git", match: true },
  ]
  const reqSkills = [
    { name: "Python", match: true },
    { name: "Docker", match: false },
    { name: "AWS", match: false },
    { name: "Kubernetes", match: false },
  ]

  return (
    <div className="hero-stage">
      <div className="comparison-panels">
        <motion.div
          className="comparison-panel"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="comparison-panel-title">Your Skills</div>
          {yourSkills.map((s, i) => (
            <motion.div
              key={s.name}
              className="comparison-item"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.2 }}
            >
              <span className="comparison-check">✔</span>
              <span>{s.name}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="comparison-panel"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="comparison-panel-title">Required Skills</div>
          {reqSkills.map((s, i) => (
            <motion.div
              key={s.name}
              className="comparison-item"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.2 }}
            >
              <span className={s.match ? "comparison-check" : "comparison-cross"}>
                {s.match ? "✔" : "❌"}
              </span>
              <span style={s.match ? {} : { color: "#FCA5A5" }}>{s.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

/* ────────────────── STEP 5: GAP DETECTION ────────────────── */
function Step5GapDetection() {
  const missing = ["Docker", "AWS", "Kubernetes"]
  return (
    <div className="hero-stage">
      <motion.div
        className="gap-card"
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 14 }}
      >
        <div className="gap-card-title">
          <AlertTriangle size={15} />
          Missing Skills Detected
        </div>
        {missing.map((s, i) => (
          <motion.div
            key={s}
            className="gap-skill"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.25, type: "spring" }}
          >
            {s}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

/* ────────────────── STEP 6: AI ROADMAP ────────────────── */
function Step6Roadmap() {
  const items = ["Learn Docker", "Learn AWS", "Learn Kubernetes"]
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    items.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), 500 + i * 650))
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="hero-stage">
      <motion.div
        className="roadmap-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="roadmap-title">
          <BookOpen size={15} />
          Learning Roadmap
        </div>
        {items.map((item, i) => (
          <motion.div
            key={item}
            className="roadmap-item"
            initial={{ opacity: 0 }}
            animate={i < visibleCount ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {i + 1}. {item}
            {i === visibleCount - 1 && <span className="typing-cursor" />}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export function HeroAnimation() {
  const [currentStep, setCurrentStep] = useState(0)
  // Use a ref to track the step for the timer callback.
  // This avoids closure staleness and React StrictMode double-firing bugs.
  const stepRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Single timer chain — each call schedules the next step.
    function scheduleNext() {
      const nextStep = (stepRef.current + 1) % TOTAL_STEPS
      const duration = STEP_DURATIONS[stepRef.current] // how long current step stays
      timerRef.current = setTimeout(() => {
        stepRef.current = nextStep
        setCurrentStep(nextStep)
        scheduleNext()
      }, duration)
    }

    // Start the chain immediately.
    scheduleNext()

    // Cleanup cancels whatever pending timeout exists.
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, []) // ← empty deps: effect runs once; ref-based so no stale closures

  const STEP_COMPONENTS = [
    Step1Upload,
    Step2Scanning,
    Step3Extraction,
    Step4Comparison,
    Step5GapDetection,
    Step6Roadmap,
  ]

  const StepComponent = STEP_COMPONENTS[currentStep]
  const showParticles = currentStep === 1 || currentStep === 2 || currentStep === 5

  return (
    <div className="hero-anim" id="hero-animation">
      <ParticleCanvas active={showParticles} />

      <div className="hero-anim-inner">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ width: "100%", height: "100%" }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step label */}
      <div className="hero-anim-step-label" key={`label-${currentStep}`}>
        Step {currentStep + 1} — {STEP_LABELS[currentStep]}
      </div>

      {/* Step dots */}
      <div className="hero-anim-steps">
        {STEP_LABELS.map((label, i) => (
          <div
            key={i}
            className={`hero-anim-step-dot ${
              i === currentStep
                ? "hero-anim-step-dot--active"
                : i < currentStep
                ? "hero-anim-step-dot--done"
                : ""
            }`}
            title={label}
          />
        ))}
      </div>
    </div>
  )
}

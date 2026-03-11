import { motion, useMotionValue, useSpring } from "framer-motion"
import { useRef, useState, useCallback, type ReactNode, type MouseEvent } from "react"

/* ─── Types ─── */
interface InteractiveButtonProps {
  children: ReactNode
  variant: "primary" | "outline"
  size?: "sm" | "md" | "lg"
  href?: string
  onClick?: () => void
  className?: string
  fullWidth?: boolean
  disabled?: boolean
}

/* ─── Bubble particle ─── */
interface Bubble {
  id: number
  x: number
  size: number
  delay: number
  duration: number
}

/* ─── Ripple ─── */
interface Ripple {
  id: number
  x: number
  y: number
}

let bubbleId = 0
let rippleId = 0

const sizeClasses = {
  sm: "hero-btn-sm",
  md: "hero-btn-md",
  lg: "hero-btn-lg",
}

export function InteractiveHeroButton({
  children,
  variant,
  size = "lg",
  href,
  onClick,
  className = "",
  fullWidth = false,
  disabled = false,
}: InteractiveButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [ripples, setRipples] = useState<Ripple[]>([])
  const [isHovered, setIsHovered] = useState(false)

  /* ─── Magnetic cursor (subtle 3-6px) ─── */
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 })

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current || disabled) return
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      mouseX.set(Math.max(-5, Math.min(5, dx * 0.04)))
      mouseY.set(Math.max(-5, Math.min(5, dy * 0.04)))
    },
    [mouseX, mouseY, disabled],
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
    setBubbles([])
  }, [mouseX, mouseY])

  /* ─── Bubble hover effect ─── */
  const handleMouseEnter = useCallback(() => {
    if (disabled) return
    setIsHovered(true)
    const newBubbles: Bubble[] = Array.from({ length: 5 }, () => ({
      id: bubbleId++,
      x: 10 + Math.random() * 80,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 0.4,
      duration: 1.2 + Math.random() * 1,
    }))
    setBubbles(newBubbles)
  }, [disabled])

  /* ─── Ripple click effect ─── */
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (disabled || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const newRipple: Ripple = { id: rippleId++, x, y }
      setRipples((prev) => [...prev, newRipple])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 600)
      onClick?.()
    },
    [onClick, disabled],
  )

  const isPrimary = variant === "primary"

  const content = (
    <motion.div
      ref={ref}
      className={`hero-btn-interactive ${isPrimary ? "hero-btn-primary" : "hero-btn-outline"} ${sizeClasses[size]} ${fullWidth ? "hero-btn-full" : ""} ${disabled ? "hero-btn-disabled" : ""} ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Animated gradient background (primary only) */}
      {isPrimary && <div className="hero-btn-gradient" />}

      {/* Glow layer */}
      <div className={`hero-btn-glow ${isHovered ? "hero-btn-glow--active" : ""}`} />

      {/* Bubbles */}
      {bubbles.map((bubble) => (
        <motion.span
          key={bubble.id}
          className="hero-btn-bubble"
          style={{
            left: `${bubble.x}%`,
            width: bubble.size,
            height: bubble.size,
          }}
          initial={{ bottom: -4, opacity: 0 }}
          animate={{ bottom: "110%", opacity: [0, 0.6, 0] }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Ripples */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className={`hero-btn-ripple ${isPrimary ? "hero-btn-ripple--primary" : "hero-btn-ripple--outline"}`}
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}

      {/* Content */}
      <span className="hero-btn-content">{children}</span>
    </motion.div>
  )

  if (href?.startsWith("#")) {
    return <a href={href}>{content}</a>
  }

  return content
}

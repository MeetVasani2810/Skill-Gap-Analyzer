import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Menu, X, LogOut, User, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from "@/context/AuthContext"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/app", label: "Analyze" },
  { href: "/about", label: "About Tech" },
]

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate("/")
  }

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg gradient-primary group-hover:scale-110 transition-transform">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg display-text">
                Skill Gap <span className="gradient-text">Analyzer</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                    }`}
                >
                  {link.label}
                  {location.pathname === link.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 gradient-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              {/* Auth Buttons / User Menu */}
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated ? (
                  /* User Dropdown */
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-medium">
                        {user?.name ? getInitials(user.name) : "U"}
                      </div>
                      <span className="text-sm font-medium max-w-[120px] truncate">
                        {user?.name?.split(" ")[0] || "User"}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-card border border-border shadow-strong overflow-hidden"
                        >
                          <div className="p-3 border-b border-border">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          </div>
                          <div className="p-2">
                            <Link
                              to="/app"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                            >
                              <User className="h-4 w-4" />
                              Analyze Resume
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-destructive"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Login/Signup Buttons */
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg gradient-primary btn-glow transition-all hover:opacity-90"
                    >
                      Sign Up Free
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-border"
            >
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-muted-foreground"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Auth */}
                <div className="mt-2 pt-2 border-t border-border">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 mb-2">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                        className="w-full mx-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-muted rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block mx-4 mt-2 text-center py-2 text-sm font-medium text-white rounded-lg gradient-primary"
                      >
                        Sign Up Free
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg gradient-primary">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">Skill Gap Analyzer</span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-md">
                AI-powered resume analysis with zero hallucinations. Get personalized
                learning roadmaps to bridge your skill gaps and land your dream job.
              </p>
              <div className="flex gap-2 mt-4">
                <span className="text-xs text-muted-foreground">🔒 Privacy-First</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">🚀 Instant Results</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">✨ Zero Cost</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/app" className="hover:text-primary transition-colors">Analyze Resume</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">About the Tech</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {isAuthenticated ? (
                  <li>
                    <button onClick={handleLogout} className="hover:text-primary transition-colors">
                      Sign Out
                    </button>
                  </li>
                ) : (
                  <>
                    <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
                    <li><Link to="/signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Skill Gap Analyzer
            </p>

          </div>
        </div>
      </footer>
    </div>
  )
}

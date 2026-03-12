import { useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
    Zap,
    AlertCircle,
    Loader2,
    Shield,
    Sparkles,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { InteractiveHeroButton } from "@/components/InteractiveHeroButton"

export function LoginPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { loginWithGoogle, isAuthenticated, isLoading } = useAuth()

    const error = searchParams.get("error")

    // If already authenticated, redirect to app
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate("/app", { replace: true })
        }
    }, [isAuthenticated, isLoading, navigate])

    const getErrorMessage = (errorCode: string | null) => {
        switch (errorCode) {
            case "token_exchange_failed":
                return "Failed to authenticate with Google. Please try again."
            case "userinfo_failed":
                return "Could not retrieve your Google profile. Please try again."
            case "database_error":
                return "Server error. Please try again later."
            case "server_error":
                return "An unexpected error occurred. Please try again."
            case "no_code":
                return "Authentication was cancelled."
            default:
                return errorCode ? "Authentication failed. Please try again." : null
        }
    }

    const errorMessage = getErrorMessage(error)

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Card */}
                <div className="p-8 rounded-2xl bg-card border border-border shadow-strong">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg gradient-primary">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg">
                                Skill Gap <span className="gradient-text">Analyzer</span>
                            </span>
                        </Link>
                        <h1 className="text-2xl font-bold display-text mb-2">Welcome</h1>
                        <p className="text-muted-foreground text-sm">
                            Sign in to start your skill journey
                        </p>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-sm"
                        >
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {errorMessage}
                        </motion.div>
                    )}

                    {/* Google Sign In Button */}
                    <InteractiveHeroButton
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={loginWithGoogle}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </InteractiveHeroButton>

                    {/* Info Text */}
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        By continuing, you agree to let us access your Google profile information
                        (name, email, and photo) to create your account.
                    </p>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 flex justify-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" />
                        Secure OAuth 2.0
                    </span>
                    <span className="flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        Free to Use
                    </span>
                </div>
            </motion.div>
        </div>
    )
}

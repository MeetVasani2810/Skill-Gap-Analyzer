import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

/**
 * This page handles the redirect after Google OAuth.
 * The backend sets the JWT cookie and redirects here.
 * We just need to check auth status and navigate to the app.
 */
export function AuthCallbackPage() {
    const navigate = useNavigate()
    const { checkAuth } = useAuth()

    useEffect(() => {
        const handleCallback = async () => {
            // The JWT cookie was already set by the backend redirect.
            // We just need to verify it and load the user.
            await checkAuth()
            navigate("/app", { replace: true })
        }
        handleCallback()
    }, [checkAuth, navigate])

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Signing you in...</p>
            </div>
        </div>
    )
}

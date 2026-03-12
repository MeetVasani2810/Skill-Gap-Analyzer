import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1'

interface User {
    id: string
    email: string
    name: string
    avatar: string
    googleId: string
    createdAt: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    loginWithGoogle: () => void
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check for existing session on mount
    const checkAuth = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                credentials: 'include',
            })
            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            } else {
                setUser(null)
            }
        } catch {
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    const loginWithGoogle = () => {
        // Redirect to backend OAuth endpoint which will redirect to Google
        window.location.href = `${API_BASE_URL}/auth/login`
    }

    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            })
        } catch {
            // Ignore errors, clear state anyway
        }
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            loginWithGoogle,
            logout,
            checkAuth,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

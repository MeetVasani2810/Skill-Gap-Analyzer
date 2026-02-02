import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
    id: string
    email: string
    name: string
    createdAt: Date
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
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

// Simple local storage key for auth
const AUTH_STORAGE_KEY = 'skill_gap_auth_user'
const USERS_STORAGE_KEY = 'skill_gap_users'

// Simple password hashing (for demo purposes - use proper hashing in production)
function simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return hash.toString(36)
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser)
                setUser({
                    ...parsed,
                    createdAt: new Date(parsed.createdAt)
                })
            } catch (e) {
                localStorage.removeItem(AUTH_STORAGE_KEY)
            }
        }
        setIsLoading(false)
    }, [])

    // Get all registered users
    const getUsers = (): Record<string, { name: string; passwordHash: string; createdAt: string }> => {
        try {
            const stored = localStorage.getItem(USERS_STORAGE_KEY)
            return stored ? JSON.parse(stored) : {}
        } catch {
            return {}
        }
    }

    // Save users
    const saveUsers = (users: Record<string, { name: string; passwordHash: string; createdAt: string }>) => {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    }

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const users = getUsers()
        const userRecord = users[email.toLowerCase()]

        if (!userRecord) {
            return { success: false, error: 'No account found with this email' }
        }

        if (userRecord.passwordHash !== simpleHash(password)) {
            return { success: false, error: 'Incorrect password' }
        }

        const loggedInUser: User = {
            id: simpleHash(email),
            email: email.toLowerCase(),
            name: userRecord.name,
            createdAt: new Date(userRecord.createdAt)
        }

        setUser(loggedInUser)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser))

        return { success: true }
    }

    const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const users = getUsers()
        const normalizedEmail = email.toLowerCase()

        if (users[normalizedEmail]) {
            return { success: false, error: 'An account with this email already exists' }
        }

        // Create new user
        users[normalizedEmail] = {
            name,
            passwordHash: simpleHash(password),
            createdAt: new Date().toISOString()
        }
        saveUsers(users)

        const newUser: User = {
            id: simpleHash(normalizedEmail),
            email: normalizedEmail,
            name,
            createdAt: new Date()
        }

        setUser(newUser)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))

        return { success: true }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem(AUTH_STORAGE_KEY)
    }

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            signup,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

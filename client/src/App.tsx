import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { LandingPage } from "@/pages/LandingPage"
import { AppPage } from "@/pages/AppPage"
import { ResultsPage } from "@/pages/ResultsPage"
import { AboutTechPage } from "@/pages/AboutTechPage"
import { LoginPage } from "@/pages/LoginPage"
import { AuthCallbackPage } from "@/pages/AuthCallbackPage"
import { ThemeProvider } from "@/components/ThemeProvider"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/about" element={<AboutTechPage />} />

              {/* OAuth Callback */}
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Protected Routes - Require Authentication */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <AppPage />
                </ProtectedRoute>
              } />
              <Route path="/results" element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

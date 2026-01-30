import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { LandingPage } from "@/pages/LandingPage"
import { AppPage } from "@/pages/AppPage"
import { ResultsPage } from "@/pages/ResultsPage"
import { AboutTechPage } from "@/pages/AboutTechPage"
import { ThemeProvider } from "@/components/ThemeProvider"
import "@/styles/globals.css"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<AppPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/about" element={<AboutTechPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

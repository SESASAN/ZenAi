import { Suspense, lazy } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import "@/App.css"
import { useAuth } from "@/services/firebase/useAuth"

const LandingPage = lazy(async () => {
  const module = await import("@/pages/LandingPage")
  return { default: module.LandingPage }
})

const LoginPage = lazy(async () => {
  const module = await import("@/pages/LoginPage")
  return { default: module.LoginPage }
})

const RegisterPage = lazy(async () => {
  const module = await import("@/pages/RegisterPage")
  return { default: module.RegisterPage }
})

const ChatPage = lazy(() => import("@/pages/ChatPage"))

function App() {
  const { user, isLoading: isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return (
      <div className="login-page">
        <div className="login-atmospheric">
          <div className="login-glow login-glow--top" />
          <div className="login-glow login-glow--bottom" />
          <div className="login-bg-glow" />
        </div>
        <div className="login-branding">
          <h1 className="login-title">ZenAI</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Suspense fallback={<div className="login-page" />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<div className="login-page" />}>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/login" element={<Navigate to="/chat" replace />} />
        <Route path="/register" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatPage user={user} />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App

import { Routes, Route, Navigate } from "react-router-dom"

import {
  AboutPage,
  LandingPage,
  LegalPage,
  LoginPage,
  NotFoundPage,
  RecoverPasswordPage,
  RegisterPage,
} from "@/routes/lazyPages"

const PRIVATE_PATHS = ["/chat", "/ajustes", "/ajustes/perfil", "/historial"]

export function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar" element={<RecoverPasswordPage />} />
      <Route path="/acerca" element={<AboutPage />} />
      <Route path="/legal" element={<LegalPage />} />
      {/* Private pages ask for a session first. */}
      {PRIVATE_PATHS.map((path) => (
        <Route key={path} path={path} element={<Navigate to="/login" replace />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

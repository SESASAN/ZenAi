import { Routes, Route, Navigate } from "react-router-dom"

import { LandingPage, LoginPage, RegisterPage } from "@/routes/lazyPages"

export function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


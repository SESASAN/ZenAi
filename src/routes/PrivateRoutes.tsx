import type { User } from "firebase/auth"
import { Routes, Route, Navigate } from "react-router-dom"

import {
  AboutPage,
  ChatPage,
  HistoryPage,
  LegalPage,
  NotFoundPage,
  ProfilePage,
  SettingsPage,
} from "@/routes/lazyPages"

export function PrivateRoutes({ user }: { user: User }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/login" element={<Navigate to="/chat" replace />} />
      <Route path="/register" element={<Navigate to="/chat" replace />} />
      <Route path="/recuperar" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<ChatPage user={user} />} />
      <Route path="/ajustes" element={<SettingsPage />} />
      <Route path="/ajustes/perfil" element={<ProfilePage user={user} />} />
      <Route path="/historial" element={<HistoryPage user={user} />} />
      <Route path="/acerca" element={<AboutPage />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

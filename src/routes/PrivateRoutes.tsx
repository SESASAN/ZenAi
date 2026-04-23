import type { User } from "firebase/auth"
import { Routes, Route, Navigate } from "react-router-dom"

import { ChatPage } from "@/routes/lazyPages"

export function PrivateRoutes({ user }: { user: User }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/login" element={<Navigate to="/chat" replace />} />
      <Route path="/register" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<ChatPage user={user} />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}


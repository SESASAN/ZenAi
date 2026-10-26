import { lazy } from "react"

export const LandingPage = lazy(async () => {
  const module = await import("@/pages/LandingPage")
  return { default: module.LandingPage }
})

export const LoginPage = lazy(async () => {
  const module = await import("@/pages/LoginPage")
  return { default: module.LoginPage }
})

export const RegisterPage = lazy(async () => {
  const module = await import("@/pages/RegisterPage")
  return { default: module.RegisterPage }
})

export const RecoverPasswordPage = lazy(async () => {
  const module = await import("@/pages/RecoverPasswordPage")
  return { default: module.RecoverPasswordPage }
})

export const AboutPage = lazy(async () => {
  const module = await import("@/pages/AboutPage")
  return { default: module.AboutPage }
})

export const LegalPage = lazy(async () => {
  const module = await import("@/pages/LegalPage")
  return { default: module.LegalPage }
})

export const NotFoundPage = lazy(async () => {
  const module = await import("@/pages/NotFoundPage")
  return { default: module.NotFoundPage }
})

export const SettingsPage = lazy(async () => {
  const module = await import("@/pages/SettingsPage")
  return { default: module.SettingsPage }
})

export const ProfilePage = lazy(async () => {
  const module = await import("@/pages/ProfilePage")
  return { default: module.ProfilePage }
})

export const HistoryPage = lazy(async () => {
  const module = await import("@/pages/HistoryPage")
  return { default: module.HistoryPage }
})

export const ChatPage = lazy(() => import("@/pages/ChatPage"))

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

export const ChatPage = lazy(() => import("@/pages/ChatPage"))


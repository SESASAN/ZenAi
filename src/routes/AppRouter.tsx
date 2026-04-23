import { Suspense } from "react"

import { useAuth } from "@/services/firebase/useAuth"
import { AppLoadingScreen } from "@/components/auth/AppLoadingScreen"
import { PublicRoutes } from "@/routes/PublicRoutes"
import { PrivateRoutes } from "@/routes/PrivateRoutes"

export function AppRouter() {
  const { user, isLoading: isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return <AppLoadingScreen />
  }

  return (
    <Suspense fallback={<div className="login-page" />}>
      {user ? (
        <PrivateRoutes user={user} />
      ) : (
        <PublicRoutes />
      )}
    </Suspense>
  )
}


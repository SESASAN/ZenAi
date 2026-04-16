import type { ReactNode } from "react"
import { AmbientBackground } from "@/components/layout/AmbientBackground"

interface AppShellProps {
  sidebar: ReactNode
  header: ReactNode
  children: ReactNode
}

export function AppShell({ sidebar, header, children }: AppShellProps) {
  return (
    <div className="appShell">
      <AmbientBackground />

      <div className="appShell__layout">
        {sidebar}

        <main className="appShell__main">
          {header}
          {children}
        </main>
      </div>
    </div>
  )
}

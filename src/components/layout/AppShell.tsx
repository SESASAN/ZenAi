import type { ReactNode } from "react"

interface AppShellProps {
  sidebar: ReactNode
  header: ReactNode
  children: ReactNode
  /** While the mobile drawer is open, the page behind it can't be focused or clicked. */
  isSidebarOpen?: boolean
}

export function AppShell({ sidebar, header, children, isSidebarOpen = false }: AppShellProps) {
  return (
    <div className="appShell">
      {sidebar}
      <main className="appShell__main" inert={isSidebarOpen}>
        {header}
        {children}
      </main>
    </div>
  )
}

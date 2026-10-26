import { Component, type ErrorInfo, type ReactNode } from "react"
import { ZenLogo } from "@/components/ui/ZenMark"
import { Icon } from "@/components/ui/Icon"

type State = { error: Error | null; at: Date | null }

/** Last line of defense: a calm page instead of a blank screen when rendering fails. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, at: null }

  static getDerivedStateFromError(error: Error): State {
    return { error, at: new Date() }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ZenAI UI error", error, info.componentStack)
  }

  render() {
    const { error, at } = this.state
    if (!error) return this.props.children

    const home = import.meta.env.BASE_URL
    return (
      <div className="statusPage">
        <header className="statusPage__header">
          <ZenLogo size={24} />
        </header>
        <main className="statusPage__main">
          <div className="statusPage__card">
            <span className="statusPage__badge" aria-hidden="true">
              <Icon name="alert" size={24} />
            </span>
            <h1 className="statusPage__title">Algo salió mal al cargar ZenAI</h1>
            <p className="statusPage__desc">
              No es culpa tuya. Recargar la página suele resolverlo; tus conversaciones están a salvo en tu cuenta.
            </p>
            <div className="statusPage__actions statusPage__actions--start">
              <button className="btn btn--primary" type="button" onClick={() => window.location.reload()}>
                <Icon name="refresh" size={16} />
                Recargar
              </button>
              <a className="btn btn--secondary" href={home}>Página de inicio</a>
            </div>
            <details className="statusPage__details">
              <summary>Detalles para reportar el problema</summary>
              <pre>
                {error.name}: {error.message}
                {"\n"}
                {at?.toLocaleString("es")}
              </pre>
              <p>
                Puedes reportarlo en{" "}
                <a href="https://github.com/SESASAN/ZenAi/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a>.
              </p>
            </details>
          </div>
        </main>
      </div>
    )
  }
}

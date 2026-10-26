import { ZenMark } from "@/components/ui/ZenMark"

export function AppLoadingScreen() {
  return (
    <div className="loadingScreen" role="status" aria-label="Cargando tu sesión">
      <ZenMark size={48} strokeWidth={2} className="loadingScreen__mark" />
      <span className="loadingScreen__text">Cargando tu sesión…</span>
    </div>
  )
}

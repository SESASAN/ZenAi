import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

/**
 * Built from how the app works today. Have someone with legal knowledge review the text
 * when the product changes.
 */
export function LegalPage() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" })
  }, [hash])

  return (
    <div className="infoPage">
      <SiteHeader showNav={false} />
      <div className="legal">
        <aside className="legal__toc" aria-label="En esta página">
          <p className="legal__tocTitle">En esta página</p>
          <a href="#privacidad">Privacidad</a>
          <a href="#datos">Qué datos guardamos</a>
          <a href="#terceros">Servicios de terceros</a>
          <a href="#control">Tu control</a>
          <a href="#terminos">Términos de uso</a>
          <a href="#contacto">Contacto</a>
        </aside>

        <main className="prose legal__body">
          <h1 id="privacidad" className="prose__title">Privacidad y términos</h1>
          <p className="legal__updated">Última actualización: 26 de octubre de 2026</p>
          <p className="prose__lead">Esta página explica qué información guarda ZenAI cuando lo usas y las reglas básicas del servicio.</p>

          <h2 id="datos">Qué datos guardamos</h2>
          <ul>
            <li><strong>Tu cuenta:</strong> nombre, correo y, si entras con Google o GitHub, tu foto de perfil.</li>
            <li><strong>Tus conversaciones:</strong> los mensajes que envías y las respuestas, con su título, fecha y el modelo usado.</li>
            <li><strong>Contadores de uso:</strong> cuántos mensajes enviaste por minuto y por día, para aplicar los límites.</li>
          </ul>
          <p>Los usamos para que puedas iniciar sesión, ver tu historial desde cualquier dispositivo y evitar el abuso del servicio.</p>

          <h2 id="terceros">Servicios de terceros</h2>
          <p>
            ZenAI usa Firebase (Google) para el inicio de sesión y para guardar datos, Vercel para el servidor, y Groq y
            Cerebras para generar las respuestas. Tus mensajes se envían a esos proveedores de IA para obtener la respuesta y
            quedan sujetos a sus propias políticas.
          </p>

          <h2 id="control">Tu control</h2>
          <p>
            Puedes borrar cualquier conversación desde el historial; se elimina de todos tus dispositivos. También puedes
            eliminar tu cuenta y todas tus conversaciones desde Perfil y cuenta.
          </p>

          <h2 id="terminos">Términos de uso</h2>
          <ul>
            <li>ZenAI es un proyecto en desarrollo y puede cambiar o dejar de estar disponible.</li>
            <li>Las respuestas las genera un modelo de IA y pueden contener errores. Verifica la información importante.</li>
            <li>No uses ZenAI para actividades ilegales ni para dañar a otras personas.</li>
            <li>Existen límites de uso para mantener el servicio disponible para todos.</li>
          </ul>

          <h2 id="contacto">Contacto</h2>
          <p>
            Si tienes dudas sobre la privacidad o los términos, abre un reporte en{" "}
            <a href="https://github.com/SESASAN/ZenAi/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a>.
          </p>
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}

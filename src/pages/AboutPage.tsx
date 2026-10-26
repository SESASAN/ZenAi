import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { Icon } from "@/components/ui/Icon"

const STACK: Array<[string, string]> = [
  ["Interfaz", "React 19, TypeScript y Vite"],
  ["Acceso", "Firebase Authentication: correo, Google y GitHub"],
  ["Servidor", "Funciones serverless en Vercel"],
  ["Datos", "Firestore"],
  ["Modelos", "Groq y Cerebras, con respuestas en streaming"],
  ["Límites", "Por defecto, 10 mensajes por minuto, 200 por día y 8000 caracteres por mensaje"],
]

export function AboutPage() {
  return (
    <div className="infoPage">
      <SiteHeader showNav={false} />
      <main className="prose">
        <h1 className="prose__title">Acerca de ZenAI</h1>
        <p className="prose__lead">
          ZenAI es un chat web para conversar con modelos de lenguaje desde una interfaz simple. Nació como proyecto de un
          curso de desarrollo web y es de código abierto.
        </p>
        <p>
          La idea es quitar todo lo que se interpone entre tú y la conversación: sin paneles llenos de opciones, sin
          configuraciones obligatorias. Escribes, el modelo responde en tiempo real y tu historial queda guardado en tu cuenta.
        </p>

        <h2>Cómo funciona</h2>
        <p>
          Tus mensajes nunca van directo del navegador al proveedor de IA. Pasan por un servidor que guarda las claves y aplica
          los límites de uso.
        </p>
        <div className="flow" role="img" aria-label="Flujo: tu navegador envía el mensaje al servidor de ZenAI, que consulta a Groq o Cerebras y guarda la conversación en Firestore.">
          <div className="flow__row">
            <div className="flow__node">
              <strong>Tu navegador</strong>
              <span>La app. Inicia sesión con Firebase.</span>
            </div>
            <Icon name="arrowRight" size={22} className="flow__arrow" />
            <div className="flow__node flow__node--accent">
              <strong>Servidor ZenAI</strong>
              <span>Verifica tu sesión, aplica límites y guarda las claves.</span>
            </div>
            <Icon name="arrowRight" size={22} className="flow__arrow" />
            <div className="flow__node">
              <strong>Groq · Cerebras</strong>
              <span>Generan la respuesta y la envían por partes.</span>
            </div>
          </div>
          <div className="flow__below">
            <div className="flow__node">
              <strong>Firestore</strong>
              <span>Guarda tus conversaciones. Solo el servidor accede.</span>
            </div>
          </div>
        </div>

        <h2>Tecnología</h2>
        <dl className="specList">
          {STACK.map(([term, value]) => (
            <div key={term} className="specList__row">
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <section className="openSource">
          <div>
            <p className="openSource__title">Código abierto</p>
            <p className="openSource__desc">
              Creado por{" "}
              <a href="https://sesasan.is-a.dev" target="_blank" rel="noopener noreferrer">SESASAN</a>. El código, los reportes
              de errores y las sugerencias viven en GitHub.
            </p>
          </div>
          <a className="btn btn--sm btn--secondary" href="https://github.com/SESASAN/ZenAi" target="_blank" rel="noopener noreferrer">
            Ver en GitHub
            <Icon name="external" size={14} />
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

import { useEffect, useRef, useState } from "react"
import { ZenMark } from "@/components/ui/ZenMark"
import { Icon } from "@/components/ui/Icon"

type Phase = "typing" | "sent" | "thinking" | "streaming" | "done"
type DemoState = { index: number; phase: Phase; progress: number; wait: number }

/** Example exchanges (synthetic, labeled as such under the demo). Models are the real ones. */
const EXCHANGES = [
  {
    model: "Llama 3.3 70B",
    question: "¿Qué es un closure en JavaScript?",
    answer:
      "Una función que recuerda las variables del lugar donde fue creada. Así guardas estado privado sin usar variables globales.",
  },
  {
    model: "Llama 3.1 8B",
    question: "Resume la fotosíntesis en una frase",
    answer: "Las plantas usan la luz del sol para convertir agua y CO₂ en glucosa, y liberan oxígeno en el proceso.",
  },
  {
    model: "GPT‑OSS 120B",
    question: "Dame un nombre para mi proyecto final",
    answer: "¿Qué tal «Brújula»? Es corto, fácil de recordar y sugiere orientación: ideal para una app de estudio.",
  },
]

const TICK_MS = 40
const INITIAL: DemoState = { index: 0, phase: "typing", progress: 0, wait: 12 }

function step(state: DemoState): DemoState {
  if (state.wait > 0) return { ...state, wait: state.wait - 1 }
  const { question, answer } = EXCHANGES[state.index]!

  switch (state.phase) {
    case "typing":
      return state.progress < question.length
        ? { ...state, progress: state.progress + 1, wait: Math.random() < 0.12 ? 2 : 0 }
        : { ...state, phase: "sent", progress: 0, wait: 6 }
    case "sent":
      return { ...state, phase: "thinking", wait: 20 }
    case "thinking":
      return { ...state, phase: "streaming", progress: 0 }
    case "streaming":
      return state.progress < answer.split(" ").length
        ? { ...state, progress: state.progress + 1, wait: 1 }
        : { ...state, phase: "done", wait: 90 }
    case "done":
      return { index: (state.index + 1) % EXCHANGES.length, phase: "typing", progress: 0, wait: 8 }
  }
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false)
}

/** Animated preview of a conversation: the question is typed, sent, and the answer streams in. */
export function LandingDemo() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [state, setState] = useState<DemoState>(() =>
    prefersReducedMotion()
      ? { index: 0, phase: "done", progress: EXCHANGES[0]!.answer.split(" ").length, wait: 0 }
      : INITIAL,
  )

  useEffect(() => {
    if (prefersReducedMotion()) return
    const root = rootRef.current
    let visible = true
    let timer: number | undefined

    const sync = () => {
      const shouldRun = visible && document.visibilityState === "visible"
      if (shouldRun && timer === undefined) {
        timer = window.setInterval(() => setState(step), TICK_MS)
      } else if (!shouldRun && timer !== undefined) {
        window.clearInterval(timer)
        timer = undefined
      }
    }

    // Pause while off-screen or in a background tab.
    const observer =
      root && "IntersectionObserver" in window
        ? new IntersectionObserver(([entry]) => {
            visible = entry?.isIntersecting ?? true
            sync()
          })
        : null
    if (root) observer?.observe(root)
    document.addEventListener("visibilitychange", sync)
    sync()

    return () => {
      observer?.disconnect()
      document.removeEventListener("visibilitychange", sync)
      if (timer !== undefined) window.clearInterval(timer)
    }
  }, [])

  const exchange = EXCHANGES[state.index]!
  const isTyping = state.phase === "typing"
  const typed = isTyping ? exchange.question.slice(0, state.progress) : ""
  const showAnswer = state.phase === "streaming" || state.phase === "done"
  const answer = showAnswer ? exchange.answer.split(" ").slice(0, state.progress).join(" ") : ""

  return (
    <div ref={rootRef} className="landingDemo">
      <div
        className="landingPreview"
        role="img"
        aria-label="Demostración animada: una pregunta y la respuesta de ZenAI escribiéndose en tiempo real"
      >
        <div className="landingPreview__bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <em>{exchange.model}</em>
          <strong className="landingPreview__status">En línea</strong>
        </div>
        <div className="landingPreview__body landingDemo__body" aria-hidden="true">
          <div className="landingDemo__thread">
            {!isTyping ? (
              <p key={`q-${state.index}`} className="landingPreview__user landingDemo__in">
                {exchange.question}
              </p>
            ) : null}
            {state.phase === "thinking" || showAnswer ? (
              <div key={`a-${state.index}`} className="landingPreview__ai landingDemo__in">
                <span className="landingPreview__mark">
                  <ZenMark size={14} strokeWidth={2.6} className="landingDemo__spin" />
                </span>
                {state.phase === "thinking" ? (
                  <span className="landingDemo__thinking">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <p>
                    {answer}
                    {state.phase === "streaming" ? <span className="landingDemo__caret" /> : null}
                  </p>
                )}
              </div>
            ) : null}
          </div>
          <div className={`landingPreview__composer ${typed ? "landingPreview__composer--active" : ""}`}>
            <span className="landingDemo__input">
              {typed || "Escribe un mensaje"}
              {isTyping && typed ? <span className="landingDemo__caret landingDemo__caret--thin" /> : null}
            </span>
            <span
              className={`landingPreview__send ${typed ? "" : "landingPreview__send--idle"} ${
                isTyping && state.progress === exchange.question.length ? "landingPreview__send--ready" : ""
              }`}
            >
              <Icon name="send" size={15} strokeWidth={2.4} />
            </span>
          </div>
        </div>
      </div>
      <p className="landingDemo__note">Demostración animada con conversaciones de ejemplo.</p>
    </div>
  )
}

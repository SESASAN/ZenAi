import { useRef, type CSSProperties, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ZenMark } from "@/components/ui/ZenMark";
import { Icon, type IconName } from "@/components/ui/Icon";
import { LandingDemo } from "@/components/landing/LandingDemo";
import { MODEL_OPTIONS, PROVIDER_LABELS, modelKey } from "@/services/chat/models";

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "activity",
    title: "Respuestas en tiempo real",
    text: "El texto aparece mientras el modelo lo escribe. Puedes detenerlo cuando quieras.",
  },
  {
    icon: "refresh",
    title: "Tu historial, en todas partes",
    text: "Tus conversaciones se guardan en tu cuenta y las retomas desde el celular o el computador.",
  },
  {
    icon: "sliders",
    title: "Elige el modelo",
    text: "Cambia entre modelos de Groq y Cerebras según si necesitas rapidez o respuestas más completas.",
  },
  {
    icon: "lock",
    title: "Claves fuera del navegador",
    text: "Las llaves de los proveedores viven en el servidor. El navegador nunca las ve.",
  },
];

const STEPS = [
  { title: "Crea tu cuenta", text: "Con Google, GitHub o tu correo." },
  { title: "Escribe tu pregunta", text: "Hasta 8000 caracteres por mensaje." },
  { title: "Lee la respuesta mientras se escribe", text: "Y vuelve a ella cuando quieras desde tu historial." },
];

const PROMPTS = [
  "Explícame la recursión con un ejemplo",
  "Revisa por qué mi fetch da undefined",
  "Resume este párrafo en 3 ideas",
  "Hazme 5 preguntas de química",
  "Traduce este correo al inglés",
  "¿Flexbox o Grid para este layout?",
];

const MODEL_USES: Record<string, string> = {
  "groq:llama-3.3-70b-versatile": "Explicaciones completas y código. Es el predeterminado.",
  "groq:llama-3.1-8b-instant": "Preguntas cortas cuando quieres la respuesta ya.",
  "cerebras:gpt-oss-120b": "Razonamiento en tareas largas.",
  "cerebras:llama3.1-8b": "Alternativa rápida.",
};

/** Staggered entrance delay for `.rise` elements. */
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export function LandingPage() {
  const heroRef = useRef<HTMLElement | null>(null);

  // Light up the dot field around the pointer. Writes CSS variables directly to avoid re-rendering.
  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const hero = heroRef.current;
    if (!hero || event.pointerType === "touch") return;
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    hero.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <div className="landing">
      <SiteHeader />

      <main>
        <section ref={heroRef} className="landing__heroArea" onPointerMove={handlePointerMove}>
          <div className="landing__dots" aria-hidden="true" />
          <div className="landing__dots landing__dots--lit" aria-hidden="true" />

          <div className="landing__hero wrap">
            <div className="landing__heroCopy">
              <p className="landing__badge rise" style={delay(0.05)}>
                <span aria-hidden="true" />
                Código abierto · hecho con React y Firebase
              </p>
              <h1 className="landing__title">
                <span className="rise" style={delay(0.15)}>Habla</span>{" "}
                <span className="rise" style={delay(0.25)}>con</span>{" "}
                <span className="rise" style={delay(0.35)}>IA.</span>
                <br />
                <span className="rise landing__titleSoft" style={delay(0.5)}>Sin</span>{" "}
                <span className="rise landing__titleSoft" style={delay(0.6)}>ruido.</span>
              </h1>
              <p className="landing__lead rise" style={delay(0.75)}>
                ZenAI es un chat limpio para estudiar, programar y escribir. Respuestas en tiempo real, varios modelos y tu
                historial en todos tus dispositivos.
              </p>
              <div className="landing__ctas rise" style={delay(0.9)}>
                <Link to="/register" className="btn btn--primary btn--shine">
                  Crear cuenta
                  <Icon name="arrowRight" size={16} strokeWidth={2.2} className="btn__arrow" />
                </Link>
                <Link to="/login" className="btn btn--secondary">Ya tengo cuenta</Link>
              </div>
              <p className="landing__fine rise" style={delay(1)}>Entra con Google, GitHub o tu correo.</p>
            </div>

            <div className="landing__demoWrap rise" style={delay(0.5)}>
              <LandingDemo />
            </div>
          </div>

          <div className="landing__marquee rise" style={delay(1.1)}>
            <ul className="landing__track" aria-label="Ejemplos de preguntas">
              {[...PROMPTS, ...PROMPTS].map((prompt, index) => (
                <li key={index} className="landing__chip" aria-hidden={index >= PROMPTS.length ? true : undefined}>
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="funciones" className="landing__section">
          <div className="wrap landing__split">
            <div className="landing__sectionIntro reveal">
              <h2 className="landing__h2">Lo esencial, bien hecho</h2>
              <p className="landing__sectionLead">
                Nada de paneles llenos de opciones. Solo lo que necesitas para conversar con un modelo.
              </p>
            </div>
            <div className="landing__features">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="landing__feature reveal">
                  <span className="landing__featureIcon">
                    <Icon name={feature.icon} size={18} strokeWidth={1.8} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como" className="landing__section">
          <div className="wrap">
            <h2 className="landing__h2 reveal">Del registro a tu primera respuesta</h2>
            <p className="landing__sectionLead reveal">Tres pasos, menos de un minuto.</p>
            <ol className="landing__steps">
              <li className="landing__stepsLine" aria-hidden="true">
                <i />
              </li>
              {STEPS.map((stepItem, index) => (
                <li key={stepItem.title} className="landing__step reveal">
                  <span className={`landing__stepNum ${index === STEPS.length - 1 ? "landing__stepNum--last" : ""}`}>
                    {index + 1}
                  </span>
                  <h3>{stepItem.title}</h3>
                  <p>{stepItem.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="modelos" className="landing__section">
          <div className="wrap">
            <h2 className="landing__h2 reveal">Modelos disponibles</h2>
            <p className="landing__sectionLead reveal">Cambias de modelo desde el encabezado del chat.</p>
            <table className="landing__models">
              <thead>
                <tr>
                  <th scope="col">Modelo</th>
                  <th scope="col">Proveedor</th>
                  <th scope="col">Ideal para</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_OPTIONS.map((option) => (
                  <tr key={modelKey(option)} className="reveal">
                    <td>{option.label}</td>
                    <td>{PROVIDER_LABELS[option.provider]}</td>
                    <td>{MODEL_USES[modelKey(option)] ?? option.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="landing__section landing__closing">
          <div className="wrap reveal">
            <ZenMark size={52} strokeWidth={1.8} className="landing__closingMark" />
            <h2 className="landing__h2">Empieza tu primera conversación</h2>
            <p className="landing__sectionLead">Crear una cuenta toma menos de un minuto.</p>
            <Link to="/register" className="btn btn--primary btn--shine">
              Crear cuenta
              <Icon name="arrowRight" size={16} strokeWidth={2.2} className="btn__arrow" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

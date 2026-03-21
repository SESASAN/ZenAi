import { useMemo, useState } from "react"
import "@/App.css"
import { Navbar } from "@/components/Navbar"
import { MessageBubble } from "@/components/MessageBubble"
import type { Message } from "@/components/MessageBubble"
import { SendButton } from "@/components/SendButton"

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hola. Soy ZenAI. Estoy listo para ayudarte con tu proyecto."
  },
  {
    id: 2,
    role: "user",
    content: "Quiero construir una interfaz de chat elegante y bien organizada."
  },
  {
    id: 3,
    role: "assistant",
    content:
      "Perfecto. Podemos empezar por una estructura clara de componentes y una base visual consistente."
  }
]

function App() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState("")

  const isDisabled = useMemo(() => inputValue.trim().length === 0, [inputValue])

  const handleSend = () => {
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedValue
    }

    const assistantMessage: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: `Recibí tu mensaje: "${trimmedValue}". El siguiente paso es convertir esta base en una conversación dinámica.`
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInputValue("")
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSend()
  }

  return (
    <>
      <Navbar />

      <main className="appMain">
        <section className="chatShell">
          <header className="chatHeader">
            <div>
              <p className="chatEyebrow">Interfaz conversacional</p>
              <h1 className="chatTitle">Vista previa del chat</h1>
            </div>
            <p className="chatSubtitle">
              Construir interfaz de chat
            </p>
          </header>

          <section className="messageList" aria-label="Lista de mensajes">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </section>

          <form className="composer" onSubmit={handleSubmit}>
            <label className="composerLabel" htmlFor="chat-input">
              Escribe un mensaje
            </label>

            <div className="composerRow">
              <textarea
                id="chat-input"
                className="composerInput"
                placeholder="Escribe aquí lo que quieres pedirle al asistente..."
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                rows={1}
              />
              <SendButton
                label="Enviar"
                onClick={handleSend}
                disabled={isDisabled}
                type="submit"
              />
            </div>
          </form>
        </section>
      </main>
    </>
  )
}

export default App
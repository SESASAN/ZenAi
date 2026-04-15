import { useEffect, useMemo, useRef, useState } from "react"
import "@/App.css"
import { Navbar } from "@/components/Navbar"
import { MessageBubble } from "@/components/MessageBubble"
import type { Message } from "@/components/MessageBubble"
import { SendButton } from "@/components/SendButton"
import { sendChatMessage } from "@/services/chat/chatApi"

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
  const [isSending, setIsSending] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [isAltTheme, setIsAltTheme] = useState(false)
  const messageListRef = useRef<HTMLElement | null>(null)

  const isDisabled = useMemo(
    () => inputValue.trim().length === 0 || isSending,
    [inputValue, isSending]
  )

  const handleSend = async () => {
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedValue
    }

    const nextMessages = [...messages, userMessage]

    setRequestError(null)
    setMessages(nextMessages)
    setInputValue("")

    try {
      setIsSending(true)

      const response = await sendChatMessage(nextMessages)

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.message.content
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "No se pudo conectar con el backend del chat."

      setRequestError(message)
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await handleSend()
  }

  const handleInputKeyDown = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return
    }

    event.preventDefault()
    await handleSend()
  }

  useEffect(() => {
    const messageListElement = messageListRef.current

    if (!messageListElement) {
      return
    }

    messageListElement.scrollTo({
      top: messageListElement.scrollHeight,
      behavior: "smooth"
    })
  }, [messages, isSending])

  useEffect(() => {
    const theme = isAltTheme ? "sunset" : "neon"

    document.documentElement.setAttribute("data-theme", theme)
    document.body.setAttribute("data-theme", theme)

    return () => {
      document.documentElement.removeAttribute("data-theme")
      document.body.removeAttribute("data-theme")
    }
  }, [isAltTheme])

  return (
    <div>
      <Navbar
        isAltTheme={isAltTheme}
        onToggleTheme={() => setIsAltTheme((prev) => !prev)}
      />

      <main className="appMain">
        <section className="chatShell">
          <header className="chatHeader">
            <div>
              <p className="chatEyebrow">Interfaz conversacional</p>
              <h1 className="chatTitle">Chat con ZenAI</h1>
            </div>
            <p className="chatSubtitle">
              Conversación conectada a un backend local con proveedores de IA.
            </p>
          </header>

          <section
            ref={messageListRef}
            className="messageList"
            aria-label="Lista de mensajes"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isSending && (
              <p className="chatStatus" role="status">
                ZenAI está pensando...
              </p>
            )}
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
                onKeyDown={handleInputKeyDown}
                disabled={isSending}
                rows={1}
              />
              <SendButton
                label={isSending ? "Pensando..." : "Enviar"}
                disabled={isDisabled}
                type="submit"
              />
            </div>

            {requestError && (
              <p className="chatError" role="alert">
                {requestError}
              </p>
            )}
          </form>
        </section>
      </main>
    </div>
  )
}

export default App

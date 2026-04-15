import { useEffect, useMemo, useRef, useState } from "react"
import "@/App.css"
import { Navbar } from "@/components/Navbar"
import { MessageBubble } from "@/components/MessageBubble"
import type { Message } from "@/components/MessageBubble"
import { SendButton } from "@/components/SendButton"
import { sendChatMessage } from "@/services/chat/chatApi"

const FAVICON_LINK_ID = "zenai-dynamic-favicon"

type FaviconPalette = {
  glowStart: string
  glowMid: string
  ringStart: string
  ringMid: string
  ringEnd: string
  accentStrong: string
  accentSoft: string
  innerStart: string
  innerEnd: string
  core: string
  dash: string
  segmentA: string
  segmentB: string
}

const FAVICON_PALETTES: Record<"neon" | "sunset", FaviconPalette> = {
  neon: {
    glowStart: "#00E5FF",
    glowMid: "#00BFFF",
    ringStart: "#8AF7FF",
    ringMid: "#00E5FF",
    ringEnd: "#009DFF",
    accentStrong: "#0EDCFF",
    accentSoft: "#38E8FF",
    innerStart: "#071A26",
    innerEnd: "#020A12",
    core: "#7DF6FF",
    dash: "#00D9FF",
    segmentA: "#B6FCFF",
    segmentB: "#7CEFFF"
  },
  sunset: {
    glowStart: "#FF9B42",
    glowMid: "#FF6A00",
    ringStart: "#FFD089",
    ringMid: "#FF9B42",
    ringEnd: "#FF6A00",
    accentStrong: "#FFB347",
    accentSoft: "#FFC46B",
    innerStart: "#2A160F",
    innerEnd: "#140904",
    core: "#FFE1B0",
    dash: "#FF8C00",
    segmentA: "#FFE0B2",
    segmentB: "#FFC46B"
  }
}

function createFaviconDataUrl(theme: "neon" | "sunset") {
  const palette = FAVICON_PALETTES[theme]

  const svg = `
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette.glowStart}" stop-opacity="0.22" />
          <stop offset="55%" stop-color="${palette.glowMid}" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#00131F" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="ringGradient" x1="64" y1="64" x2="448" y2="448">
          <stop offset="0%" stop-color="${palette.ringStart}" />
          <stop offset="45%" stop-color="${palette.ringMid}" />
          <stop offset="100%" stop-color="${palette.ringEnd}" />
        </linearGradient>
        <linearGradient id="innerGradient" x1="140" y1="120" x2="380" y2="392">
          <stop offset="0%" stop-color="${palette.innerStart}" />
          <stop offset="100%" stop-color="${palette.innerEnd}" />
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="220" fill="url(#bgGlow)" />
      <circle cx="256" cy="256" r="176" stroke="url(#ringGradient)" stroke-width="18" />
      <circle cx="256" cy="256" r="146" stroke="${palette.accentSoft}" stroke-opacity="0.75" stroke-width="6" />
      <path d="M 256 126 A 130 130 0 1 1 256 386 A 130 130 0 1 1 256 126 M 256 198 A 58 58 0 1 0 256 314 A 58 58 0 1 0 256 198" fill="url(#innerGradient)" fill-rule="evenodd" clip-rule="evenodd" stroke="${palette.accentStrong}" stroke-opacity="0.35" stroke-width="2" />
      <circle cx="256" cy="256" r="58" fill="none" stroke="${palette.core}" stroke-width="5" />
      <circle cx="256" cy="256" r="82" stroke="${palette.dash}" stroke-opacity="0.8" stroke-width="4" stroke-dasharray="18 10" />
      <path d="M256 92 A164 164 0 0 1 340 115" stroke="${palette.segmentA}" stroke-width="8" stroke-linecap="round" />
      <path d="M398 172 A164 164 0 0 1 420 256" stroke="${palette.segmentB}" stroke-width="8" stroke-linecap="round" />
      <path d="M420 256 A164 164 0 0 1 398 340" stroke="${palette.accentSoft}" stroke-width="8" stroke-linecap="round" />
      <path d="M172 398 A164 164 0 0 1 92 256" stroke="${palette.segmentB}" stroke-width="8" stroke-linecap="round" />
      <circle cx="256" cy="256" r="104" stroke="${palette.ringMid}" stroke-opacity="0.22" stroke-width="2" />
      <circle cx="256" cy="256" r="116" stroke="${palette.ringMid}" stroke-opacity="0.14" stroke-width="2" />
    </svg>
  `.trim()

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
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

    let faviconLink = document.getElementById(FAVICON_LINK_ID) as HTMLLinkElement | null

    if (!faviconLink) {
      faviconLink = document.createElement("link")
      faviconLink.id = FAVICON_LINK_ID
      faviconLink.rel = "icon"
      faviconLink.type = "image/svg+xml"
      document.head.appendChild(faviconLink)
    }

    faviconLink.href = createFaviconDataUrl(theme)

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

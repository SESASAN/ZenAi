import { useEffect, useMemo, useRef, useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import "@/App.css"
import type { Message } from "@/components/MessageBubble"
import { SendButton } from "@/components/SendButton"
import { ChatTimeline } from "@/components/chat/ChatTimeline"
import { AppShell } from "@/components/layout/AppShell"
import { SessionHeader } from "@/components/layout/SessionHeader"
import { SideNav } from "@/components/layout/SideNav"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { sendChatMessage, RateLimitError } from "@/services/chat/chatApi"
import { RateLimitAlert } from "@/components/RateLimitAlert"
import { useAuth } from "@/services/firebase/useAuth"
import {
  buildConversationTitle,
  createConversation,
  loadConversations,
  saveConversations,
  type ChatConversation
} from "@/services/chat/chatStorage"

function App() {
  const { user, isLoading: isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return (
      <div className="login-page">
        <div className="login-atmospheric">
          <div className="login-glow login-glow--top" />
          <div className="login-glow login-glow--bottom" />
          <div className="login-bg-glow" />
        </div>
        <div className="login-branding">
          <h1 className="login-title">ZenAI</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/login" element={<Navigate to="/chat" replace />} />
      <Route path="/register" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<ChatView user={user} />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}

function ChatView({ user }: { user: NonNullable<ReturnType<typeof useAuth>["user"]> }) {
  const uid = user.uid
  const userInitial = (user.displayName ?? user.email ?? "U").trim().slice(0, 1).toUpperCase()
  const userAvatarUrl = user.photoURL ?? null
  const { signIn, signOut } = useAuth()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messageListRef = useRef<HTMLElement | null>(null)
  const composerDockRef = useRef<HTMLDivElement | null>(null)
  const shouldScrollOnNextUserMessageRef = useRef(false)

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  )

  const messages = useMemo(
    () => activeConversation?.messages ?? [],
    [activeConversation]
  )

  const isDisabled = useMemo(
    () => inputValue.trim().length === 0 || isSending,
    [inputValue, isSending]
  )

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations]
  )

  const scrollTimelineToBottom = (behavior: ScrollBehavior = "auto") => {
    const messageListElement = messageListRef.current

    if (!messageListElement) {
      return
    }

    const endSentinel = messageListElement.querySelector("[data-chat-end]") as HTMLElement | null

    if (endSentinel) {
      endSentinel.scrollIntoView({
        block: "end",
        behavior
      })
    }

    const top = messageListElement.scrollHeight

    try {
      messageListElement.scrollTo({
        top,
        behavior
      })
    } catch {
      messageListElement.scrollTop = top
    }
  }

  const handleCreateConversation = () => {
    const newConversation = createConversation()

    setConversations((prev) => [newConversation, ...prev])
    setActiveConversationId(newConversation.id)
    setInputValue("")
    setRequestError(null)
    setIsSidebarOpen(false)
  }

  const handleSend = async () => {
    if (!activeConversation) {
      return
    }

    const trimmedValue = inputValue.trim()

    if (!trimmedValue) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedValue
    }

    const nextMessages = [...activeConversation.messages, userMessage]
    const updatedConversation: ChatConversation = {
      ...activeConversation,
      title: activeConversation.messages.length === 0
        ? buildConversationTitle(trimmedValue)
        : activeConversation.title,
      messages: nextMessages,
      updatedAt: Date.now()
    }

    setRequestError(null)
    shouldScrollOnNextUserMessageRef.current = true
    setConversations((prev) => prev.map((conversation) => (
      conversation.id === activeConversation.id ? updatedConversation : conversation
    )))
    setInputValue("")

    try {
      setIsSending(true)

      const idToken = await user.getIdToken()
      const response = await sendChatMessage(nextMessages, activeConversation.id, idToken)

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.message.content
      }

      setConversations((prev) => prev.map((conversation) => {
        if (conversation.id !== activeConversation.id) {
          return conversation
        }

        return {
          ...conversation,
          messages: [...updatedConversation.messages, assistantMessage],
          updatedAt: Date.now()
        }
      }))
    } catch (error) {
      if (error instanceof RateLimitError) {
        setRequestError(error.message)
        setRetryAfterSeconds(error.retryAfterSeconds)
        setIsSending(false)
        return
      }
      const message = error instanceof Error
        ? error.message
        : "No se pudo conectar con el backend del chat."

      setRequestError(message)
      setRetryAfterSeconds(null)
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
    const dockElement = composerDockRef.current

    if (!dockElement) {
      return
    }

    const updateDockHeight = () => {
      const height = dockElement.offsetHeight
      document.documentElement.style.setProperty("--composerDockHeight", `${height}px`)
    }

    updateDockHeight()

    const handleResize = () => updateDockHeight()
    window.addEventListener("resize", handleResize)

    let resizeObserver: ResizeObserver | null = null

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => updateDockHeight())
      resizeObserver.observe(dockElement)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      resizeObserver?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!uid) {
      setConversations([])
      setActiveConversationId(null)
      setInputValue("")
      setRequestError(null)
      return
    }

    const storedConversations = loadConversations(uid)
    const nextConversations = storedConversations.length > 0
      ? storedConversations
      : [createConversation()]

    setConversations(nextConversations)
    setActiveConversationId(nextConversations[0]?.id ?? null)
    setInputValue("")
    setRequestError(null)
    setRetryAfterSeconds(null)
  }, [uid])

  useEffect(() => {
    if (!uid) {
      return
    }

    saveConversations(uid, conversations)
  }, [conversations, uid])

  useEffect(() => {
    if (!activeConversationId && conversations[0]) {
      setActiveConversationId(conversations[0].id)
      return
    }

    if (activeConversationId && !conversations.some((conversation) => conversation.id === activeConversationId)) {
      setActiveConversationId(conversations[0]?.id ?? null)
    }
  }, [conversations, activeConversationId])

  useEffect(() => {
    if (!shouldScrollOnNextUserMessageRef.current) {
      return
    }

    const lastMessage = messages.at(-1)

    if (!lastMessage || lastMessage.role !== "user") {
      return
    }

    shouldScrollOnNextUserMessageRef.current = false

    window.requestAnimationFrame(() => {
      scrollTimelineToBottom("auto")
    })
  }, [messages])

  return (
    <AppShell
      sidebar={(
        <SideNav
          conversations={sortedConversations}
          activeConversationId={activeConversationId}
          isOpen={isSidebarOpen}
          userLabel={user.displayName ?? user.email ?? null}
          userAvatarUrl={userAvatarUrl}
          canCreateConversation={Boolean(user)}
          onClose={() => setIsSidebarOpen(false)}
          onCreateConversation={handleCreateConversation}
          onSelectConversation={(conversationId) => {
            setActiveConversationId(conversationId)
            setRequestError(null)
            setRetryAfterSeconds(null)
            setIsSidebarOpen(false)
          }}
          onDeleteConversation={(conversationId) => {
            const updated = conversations.filter((c) => c.id !== conversationId)
            setConversations(updated)
            if (activeConversationId === conversationId) {
              setActiveConversationId(updated[0]?.id ?? null)
            }
          }}
          onSignIn={() => void signIn()}
          onSignOut={() => void signOut()}
        />
      )}
      header={(
        <SessionHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
      )}
    >
      <div className="appMain">
        <section className="chatLayout">
          <section className="chatShell">
            <ChatTimeline
              ref={messageListRef}
              messages={messages}
              isSending={isSending}
              userInitial={userInitial}
              userAvatarUrl={userAvatarUrl}
            />
          </section>
        </section>

        <div
          ref={composerDockRef}
          className="composerDock"
          aria-label="Zona de composición del mensaje"
        >
          <div className="composerDock__inner">
            <form className="composer" onSubmit={handleSubmit}>
              <div className="composerRow">
                <textarea
                  id="chat-input"
                  className="composerInput"
                  aria-label="Escribir mensaje"
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

              {retryAfterSeconds !== null ? (
                <RateLimitAlert
                  message={requestError ?? "Se acabaron las peticiones de hoy."}
                  retryAfterSeconds={retryAfterSeconds}
                  onDismiss={() => {
                    setRetryAfterSeconds(null)
                    setRequestError(null)
                  }}
                />
              ) : requestError ? (
                <p className="chatError" role="alert">
                  {requestError}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default App

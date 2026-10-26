import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import type { User } from "firebase/auth"

import { SendButton, SEND_BUTTON_LABELS } from "@/components/SendButton"
import { ChatTimeline } from "@/components/chat/ChatTimeline"
import { AppShell } from "@/components/layout/AppShell"
import { SessionHeader, type ConnectionStatus } from "@/components/layout/SessionHeader"
import { SideNav } from "@/components/layout/SideNav"
import { RateLimitAlert } from "@/components/RateLimitAlert"
import { Icon } from "@/components/ui/Icon"
import { useAuth } from "@/services/firebase/useAuth"
import { useChat } from "@/hooks/useChat"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { CLIENT_LIMITS } from "@/services/chat/chatApi"
import { savePreferredModel } from "@/services/chat/models"

const NEAR_BOTTOM_PX = 160
const MAX_COMPOSER_HEIGHT = 220

export default function ChatPage({ user }: { user: User }) {
  const userLabel = user.displayName ?? user.email ?? null
  const userInitial = (user.displayName ?? user.email ?? "U").trim().slice(0, 1).toUpperCase()
  const userAvatarUrl = user.photoURL ?? null
  const { signOut } = useAuth()
  const chat = useChat(user)
  const isOnline = useOnlineStatus()
  const [inputValue, setInputValue] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messageListRef = useRef<HTMLElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const shouldScrollOnNextUserMessageRef = useRef(false)

  const { messages, isSending, activeConversationId } = chat
  const location = useLocation()
  const navigate = useNavigate()
  const requestedConversationId = (location.state as { conversationId?: string } | null)?.conversationId ?? null
  const visibleMessages = messages.filter((message) => message.content.length > 0)
  const isRateLimited = chat.error?.retryAfterSeconds !== undefined
  const isDisabled = inputValue.trim().length === 0 || isSending || chat.isLoadingActive || isRateLimited

  const scrollTimelineToBottom = (behavior: ScrollBehavior = "auto") => {
    const messageListElement = messageListRef.current
    if (!messageListElement) return

    const endSentinel = messageListElement.querySelector("[data-chat-end]") as HTMLElement | null
    endSentinel?.scrollIntoView?.({ block: "end", behavior })

    try {
      messageListElement.scrollTo({ top: messageListElement.scrollHeight, behavior })
    } catch {
      messageListElement.scrollTop = messageListElement.scrollHeight
    }
  }

  const handleSend = async () => {
    const value = inputValue.trim()
    if (!value || isSending || isRateLimited) return

    shouldScrollOnNextUserMessageRef.current = true
    setInputValue("")
    const sent = await chat.sendMessage(value)
    if (!sent) {
      // Give the user their text back so they can retry.
      setInputValue((current) => current || value)
    }
    inputRef.current?.focus()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await handleSend()
  }

  const handleInputKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    await handleSend()
  }

  const handleSuggestion = (prompt: string) => {
    setInputValue(prompt)
    window.requestAnimationFrame(() => {
      const input = inputRef.current
      if (!input) return
      input.focus()
      input.setSelectionRange(prompt.length, prompt.length)
    })
  }

  // Grow the composer with its content, up to a limit.
  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = "auto"
    input.style.height = `${Math.min(input.scrollHeight, MAX_COMPOSER_HEIGHT)}px`
  }, [inputValue])

  // Open the conversation picked in the history page, then clear the request.
  const { selectConversation, conversations } = chat
  useEffect(() => {
    if (!requestedConversationId) return
    if (!conversations.some((c) => c.id === requestedConversationId)) return
    selectConversation(requestedConversationId)
    navigate(".", { replace: true, state: null })
  }, [requestedConversationId, conversations, selectConversation, navigate])

  // Jump to the bottom when switching conversations.
  useEffect(() => {
    window.requestAnimationFrame(() => scrollTimelineToBottom("auto"))
  }, [activeConversationId])

  // Scroll on new user messages, and follow the streamed answer while the user is near the bottom.
  useEffect(() => {
    const lastMessage = messages.at(-1)
    if (!lastMessage) return

    if (shouldScrollOnNextUserMessageRef.current && lastMessage.role === "user") {
      shouldScrollOnNextUserMessageRef.current = false
      window.requestAnimationFrame(() => scrollTimelineToBottom("auto"))
      return
    }

    const list = messageListRef.current
    if (isSending && list) {
      const distanceToBottom = list.scrollHeight - list.scrollTop - list.clientHeight
      if (distanceToBottom < NEAR_BOTTOM_PX) scrollTimelineToBottom("auto")
    }
  }, [messages, isSending])

  const statusText = chat.isLoadingActive
    ? "Cargando conversación…"
    : chat.isWaitingForFirstToken
      ? "ZenAI está pensando…"
      : null

  const connection: ConnectionStatus = !isOnline ? "offline" : isRateLimited ? "paused" : "online"
  const charCount = inputValue.length
  const isNearLimit = charCount > CLIENT_LIMITS.maxMessageChars * 0.9

  const createConversation = () => {
    chat.createConversation()
    setInputValue("")
    setIsSidebarOpen(false)
  }

  return (
    <AppShell
      isSidebarOpen={isSidebarOpen}
      sidebar={(
        <SideNav
          conversations={chat.conversations}
          activeConversationId={activeConversationId}
          isOpen={isSidebarOpen}
          userLabel={userLabel}
          userEmail={user.displayName ? user.email : null}
          userAvatarUrl={userAvatarUrl}
          canCreateConversation={!isSending}
          onClose={() => setIsSidebarOpen(false)}
          onCreateConversation={createConversation}
          onSelectConversation={(conversationId) => {
            chat.selectConversation(conversationId)
            setIsSidebarOpen(false)
          }}
          onDeleteConversation={(conversationId) => void chat.deleteConversation(conversationId)}
          onSignOut={() => void signOut()}
        />
      )}
      header={(
        <SessionHeader
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onNewConversation={createConversation}
          canCreateConversation={!isSending}
          model={chat.model}
          onModelChange={(option) => {
            chat.setModel(option)
            savePreferredModel(option)
          }}
          isModelLocked={isSending}
          status={connection}
        />
      )}
    >
      {!isOnline ? (
        <div className="offlineBanner" role="alert">
          <Icon name="wifiOff" size={18} />
          Sin conexión a internet. Revisa tu red y vuelve a intentar el mensaje.
        </div>
      ) : null}

      <ChatTimeline
        ref={messageListRef}
        messages={visibleMessages}
        statusText={statusText}
        isThinking={chat.isWaitingForFirstToken}
        streamingMessageId={isSending ? chat.streamingMessageId : null}
        userInitial={userInitial}
        userAvatarUrl={userAvatarUrl}
        onSuggestion={handleSuggestion}
      />

      <div className="composerDock" role="region" aria-label="Escribir mensaje">
        <div className="composerDock__inner">
          {chat.error?.retryAfterSeconds !== undefined ? (
            <RateLimitAlert
              key={`${chat.error.message}-${chat.error.retryAfterSeconds}`}
              message={chat.error.message}
              retryAfterSeconds={chat.error.retryAfterSeconds}
              onDismiss={chat.dismissError}
            />
          ) : chat.error ? (
            <div className="chatAlert chatAlert--danger" role="alert">
              <Icon name={chat.error.kind === "auth" ? "lock" : chat.error.kind === "network" ? "wifiOff" : "alert"} size={20} className="chatAlert__icon" />
              <div className="chatAlert__body">
                <strong className="chatAlert__title">
                  {chat.error.kind === "auth"
                    ? "Tu sesión expiró"
                    : chat.error.kind === "network"
                      ? "No se envió"
                      : chat.error.kind === "server"
                        ? "La respuesta se interrumpió"
                        : "Algo salió mal"}
                </strong>
                <span className="chatAlert__text">{chat.error.message}</span>
                <span className="chatAlert__actions">
                  {chat.error.kind === "auth" ? (
                    <button className="btn btn--sm btn--soft" type="button" onClick={() => void signOut()}>
                      Iniciar sesión de nuevo
                    </button>
                  ) : inputValue.trim() ? (
                    <button className="btn btn--sm btn--soft" type="button" onClick={() => void handleSend()}>
                      <Icon name="refresh" size={14} />
                      Reintentar
                    </button>
                  ) : null}
                  <button className="btn btn--sm btn--secondary" type="button" onClick={chat.dismissError}>
                    Cerrar
                  </button>
                </span>
              </div>
            </div>
          ) : chat.syncError ? (
            <p className="chatSyncNote" role="status">
              <Icon name="alert" size={16} />
              {chat.syncError}
            </p>
          ) : null}

          <form className="composer" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              id="chat-input"
              className="composer__input"
              aria-label="Escribe tu mensaje"
              placeholder="Escribe un mensaje para ZenAI"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={isSending}
              maxLength={CLIENT_LIMITS.maxMessageChars}
              rows={1}
            />
            <SendButton
              label={isSending ? SEND_BUTTON_LABELS.busy : SEND_BUTTON_LABELS.send}
              disabled={isDisabled}
              isBusy={isSending}
              type="submit"
            />
          </form>

          <p className="composerDock__meta">
            <span className="composerDock__hint">ZenAI puede equivocarse. Verifica la información importante.</span>
            {charCount > 0 ? (
              <span className={`composerDock__count ${isNearLimit ? "composerDock__count--warn" : ""}`}>
                {charCount.toLocaleString("es")} / {CLIENT_LIMITS.maxMessageChars.toLocaleString("es")}
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </AppShell>
  )
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { User } from "firebase/auth"

import type { Message } from "@/components/MessageBubble"
import { ApiError, RateLimitError, sendChatMessage } from "@/services/chat/chatApi"
import { loadPreferredModel, type ModelOption } from "@/services/chat/models"
import { deleteConversation, fetchConversation, listConversations } from "@/services/chat/conversationsApi"
import {
  buildConversationTitle,
  createConversation,
  createId,
  DEFAULT_CONVERSATION_TITLE,
  isPersistedRemotely,
  loadConversations,
  mergeConversations,
  saveConversations,
  sortConversations,
  type ChatConversation,
} from "@/services/chat/chatStorage"

export type ChatErrorKind = "rateLimit" | "network" | "server" | "auth" | "other"

export type ChatError = {
  message: string
  kind?: ChatErrorKind
  retryAfterSeconds?: number
}

/** Turns API failures into short, actionable Spanish copy (server texts stay in the logs). */
function toChatError(err: unknown): ChatError {
  if (err instanceof RateLimitError) {
    return { kind: "rateLimit", message: "Enviaste varios mensajes seguidos.", retryAfterSeconds: err.retryAfterSeconds }
  }
  if (err instanceof ApiError) {
    if (err.status === 0) return { kind: "network", message: "Sin conexión a internet. Revisa tu red y vuelve a intentarlo." }
    if (err.status === 401 || err.status === 403) return { kind: "auth", message: "Tu sesión expiró. Vuelve a iniciar sesión para seguir." }
    if (err.status >= 500) {
      return { kind: "server", message: "El servicio del modelo no respondió. No es un problema de tu conexión; inténtalo de nuevo." }
    }
    return { kind: "other", message: "No pudimos procesar el mensaje. Revísalo e inténtalo de nuevo." }
  }
  return { kind: "server", message: "No pudimos conectar con el servicio de chat. Inténtalo de nuevo." }
}

type ChatUser = Pick<User, "uid" | "getIdToken">

const SYNC_ERROR = "No pudimos sincronizar tu historial. Mostramos la copia guardada en este dispositivo."

export function useChat(user: ChatUser) {
  const { uid } = user
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null)
  const [error, setError] = useState<ChatError | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [model, setModel] = useState<ModelOption>(() => loadPreferredModel())
  // Which user's cache is currently in `conversations` (null until the first load).
  const [hydratedUid, setHydratedUid] = useState<string | null>(null)
  const userRef = useRef(user)
  useEffect(() => {
    userRef.current = user
  }, [user])

  const getIdToken = useCallback(() => userRef.current.getIdToken(), [])

  const updateConversation = useCallback(
    (id: string, update: (conversation: ChatConversation) => ChatConversation) => {
      setConversations((prev) => prev.map((c) => (c.id === id ? update(c) : c)))
    },
    [],
  )

  // 1) Load the local cache instantly, then sync with the server.
  useEffect(() => {
    let cancelled = false
    const cached = loadConversations(uid)
    const initial = cached.length > 0 ? cached : [createConversation()]

    setHydratedUid(uid)
    setConversations(initial)
    setActiveConversationId(sortConversations(initial)[0]?.id ?? null)
    setError(null)
    setSyncError(null)

    void (async () => {
      try {
        const remote = await listConversations(await getIdToken())
        if (cancelled) return
        setConversations((prev) => mergeConversations(prev, remote))
      } catch {
        if (!cancelled) setSyncError(SYNC_ERROR)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [uid, getIdToken])

  // 2) Persist the cache (not on every streamed token).
  useEffect(() => {
    if (hydratedUid !== uid || isSending) return
    saveConversations(uid, conversations)
  }, [conversations, uid, hydratedUid, isSending])

  // 3) Always keep a valid active conversation (and at least one conversation).
  useEffect(() => {
    if (hydratedUid !== uid) return
    if (conversations.length === 0) {
      const fresh = createConversation()
      setConversations([fresh])
      setActiveConversationId(fresh.id)
      return
    }
    if (!activeConversationId || !conversations.some((c) => c.id === activeConversationId)) {
      setActiveConversationId(sortConversations(conversations)[0]!.id)
    }
  }, [conversations, activeConversationId, uid, hydratedUid])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  )

  // 4) Fetch messages of conversations only known by their summary.
  const needsLoad = activeConversation?.isLoaded === false ? activeConversation.id : null
  useEffect(() => {
    if (!needsLoad) return
    let cancelled = false
    setLoadingConversationId(needsLoad)

    void (async () => {
      try {
        const remote = await fetchConversation(needsLoad, await getIdToken())
        if (cancelled) return
        if (!remote) {
          setConversations((prev) => prev.filter((c) => c.id !== needsLoad))
          return
        }
        updateConversation(needsLoad, (c) => ({
          ...c,
          title: remote.title || c.title,
          preview: remote.preview,
          updatedAt: Math.max(c.updatedAt, remote.updatedAt),
          messages: remote.messages.map(({ id, role, content }) => ({ id, role, content })),
          isLoaded: true,
        }))
      } catch {
        if (!cancelled) setSyncError(SYNC_ERROR)
      } finally {
        if (!cancelled) setLoadingConversationId(null)
      }
    })()

    return () => {
      cancelled = true
      setLoadingConversationId(null)
    }
  }, [needsLoad, getIdToken, updateConversation])

  const createNewConversation = useCallback(() => {
    // Reuse an existing empty draft instead of piling up "New chat" entries.
    const draft = conversations.find((c) => c.messages.length === 0 && c.isLoaded !== false)
    if (draft) {
      setActiveConversationId(draft.id)
    } else {
      const fresh = createConversation()
      setConversations((prev) => [fresh, ...prev])
      setActiveConversationId(fresh.id)
    }
    setError(null)
  }, [conversations])

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id)
    setError(null)
  }, [])

  const removeConversation = useCallback(
    async (id: string) => {
      const previous = conversations
      const target = previous.find((c) => c.id === id)
      if (!target) return

      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (!isPersistedRemotely(target)) return

      try {
        await deleteConversation(id, await getIdToken())
      } catch {
        setConversations(previous)
        setError({ kind: "other", message: "No pudimos borrar la conversación. Inténtalo de nuevo." })
      }
    },
    [conversations, getIdToken],
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const conversation = activeConversation
      const content = text.trim()
      if (!conversation || !content || isSending || conversation.isLoaded === false) return false

      const conversationId = conversation.id
      const userMessage: Message = { id: createId(), role: "user", content }
      const assistantId = createId()
      const history = [...conversation.messages, userMessage]

      updateConversation(conversationId, (c) => ({
        ...c,
        title: c.messages.length === 0 ? buildConversationTitle(content) : c.title,
        messages: history,
        updatedAt: Date.now(),
      }))
      setError(null)
      setIsSending(true)
      setStreamingMessageId(assistantId)

      const writeAssistant = (update: (current: string) => string) =>
        updateConversation(conversationId, (c) => {
          const exists = c.messages.some((m) => m.id === assistantId)
          const messages = exists
            ? c.messages.map((m) => (m.id === assistantId ? { ...m, content: update(m.content) } : m))
            : [...c.messages, { id: assistantId, role: "assistant" as const, content: update("") }]
          return { ...c, messages }
        })

      try {
        const response = await sendChatMessage({
          messages: history,
          conversationId,
          idToken: await getIdToken(),
          provider: model.provider,
          model: model.model,
          onDelta: (delta) => writeAssistant((current) => current + delta),
        })
        writeAssistant(() => response.message.content)
        updateConversation(conversationId, (c) => ({
          ...c,
          preview: response.message.content.slice(0, 80),
          updatedAt: Date.now(),
          isLoaded: true,
        }))
        return true
      } catch (err) {
        // Roll back the turn; the page puts the text back in the composer so the user can retry.
        updateConversation(conversationId, (c) => {
          const messages = c.messages.filter((m) => m.id !== assistantId && m.id !== userMessage.id)
          return { ...c, messages, title: messages.length === 0 ? DEFAULT_CONVERSATION_TITLE : c.title }
        })
        setError(toChatError(err))
        return false
      } finally {
        setIsSending(false)
        setStreamingMessageId(null)
      }
    },
    [activeConversation, isSending, getIdToken, updateConversation, model],
  )

  const dismissError = useCallback(() => setError(null), [])

  const streamingMessage = activeConversation?.messages.find((m) => m.id === streamingMessageId)
  const isWaitingForFirstToken = isSending && !streamingMessage?.content
  const isLoadingActive = loadingConversationId !== null && loadingConversationId === activeConversationId

  return {
    conversations: useMemo(() => sortConversations(conversations), [conversations]),
    activeConversation,
    activeConversationId,
    messages: activeConversation?.messages ?? [],
    isSending,
    isWaitingForFirstToken,
    streamingMessageId,
    isLoadingActive,
    error,
    syncError,
    sendMessage,
    createConversation: createNewConversation,
    selectConversation,
    deleteConversation: removeConversation,
    dismissError,
    model,
    setModel,
    dismissSyncError: useCallback(() => setSyncError(null), []),
  }
}

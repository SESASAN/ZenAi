// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import type { User } from "firebase/auth"

import ChatPage from "@/pages/ChatPage"
import { ThemeProvider } from "@/components/ThemeContext"
import { installFakeBackend } from "../helpers/fakeBackend"
import { deltaChunk, sseResponse } from "../helpers/http"

vi.mock("@/services/firebase/useAuth", () => ({
  useAuth: () => ({ signIn: vi.fn(), signOut: vi.fn() }),
}))

const user = {
  uid: "user-1",
  displayName: "Ana",
  email: "ana@example.com",
  photoURL: null,
  getIdToken: async () => "token-user-1",
} as unknown as User

const CACHE_KEY = "zenai-chat-conversations:user-1"

function renderChat() {
  return render(
    <MemoryRouter initialEntries={["/chat"]}>
      <ThemeProvider>
        <ChatPage user={user} />
      </ThemeProvider>
    </MemoryRouter>,
  )
}

function messageList() {
  return within(screen.getByRole("region", { name: "Mensajes" }))
}

function sidebar() {
  return within(screen.getByRole("region", { name: "Conversaciones" }))
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("ChatPage", () => {
  it("sends a message, streams the answer and stores the exchange on the server", async () => {
    const backend = installFakeBackend()
    const userEvents = userEvent.setup()
    renderChat()

    expect(await screen.findByText("¿En qué te ayudo hoy?")).toBeTruthy()

    await userEvents.type(screen.getByLabelText("Escribe tu mensaje"), "¿Qué es ZenAI?{Enter}")

    expect(await messageList().findByText("Hola, soy ZenAI.")).toBeTruthy()
    expect(messageList().getByText("¿Qué es ZenAI?")).toBeTruthy()
    expect((screen.getByLabelText("Escribe tu mensaje") as HTMLTextAreaElement).value).toBe("")

    const [summary] = await backend.conversations.list("user-1")
    expect(summary?.title).toBe("¿Qué es ZenAI?")
    expect(sidebar().getByText("¿Qué es ZenAI?")).toBeTruthy()

    // Local cache is written once the answer is complete.
    await waitFor(() => expect(localStorage.getItem(CACHE_KEY)).toContain("Hola, soy ZenAI."))
  })

  it("loads history from the server on a new device", async () => {
    const backend = installFakeBackend()
    await backend.conversations.appendExchange({
      uid: "user-1",
      conversationId: "remote-1",
      title: "Recetas",
      userMessage: "Dame una receta",
      assistantMessage: "Arepas con queso",
      provider: "groq",
      model: "m",
    })
    const userEvents = userEvent.setup()
    renderChat()

    const item = await sidebar().findByText("Recetas")
    await userEvents.click(item)

    expect(await messageList().findByText("Arepas con queso")).toBeTruthy()
    expect(messageList().getByText("Dame una receta")).toBeTruthy()
    expect(backend.requests).toContainEqual({ method: "GET", path: "/api/conversations?id=remote-1" })
  })

  it("deletes conversations on the server too", async () => {
    const backend = installFakeBackend()
    await backend.conversations.appendExchange({
      uid: "user-1", conversationId: "remote-1", title: "Para borrar",
      userMessage: "a", assistantMessage: "b", provider: "groq", model: "m",
    })
    const userEvents = userEvent.setup()
    renderChat()

    await sidebar().findByText("Para borrar")
    await userEvents.click(sidebar().getByRole("button", { name: "Borrar conversación: Para borrar" }))

    await waitFor(() => expect(sidebar().queryByText("Para borrar")).toBeNull())
    await waitFor(async () => expect(await backend.conversations.list("user-1")).toEqual([]))
  })

  it("shows the rate limit countdown and gives the text back", async () => {
    installFakeBackend({ perMinute: 1 })
    const userEvents = userEvent.setup()
    renderChat()
    const input = screen.getByLabelText("Escribe tu mensaje") as HTMLTextAreaElement

    await userEvents.type(input, "uno{Enter}")
    await messageList().findByText("Hola, soy ZenAI.")

    await userEvents.type(input, "dos{Enter}")
    const alert = await screen.findByRole("alert")
    expect(alert.textContent).toMatch(/Demasiadas solicitudes/)
    expect(alert.textContent).toMatch(/(\d+m )?\d+s/)
    expect(input.value).toBe("dos")
    expect(messageList().queryByText("dos")).toBeNull()
  })

  it("shows provider errors without leaking internals", async () => {
    installFakeBackend({ providerFetch: async () => new Response("secret stack", { status: 500 }) })
    const userEvents = userEvent.setup()
    renderChat()

    await userEvents.type(screen.getByLabelText("Escribe tu mensaje"), "hola{Enter}")
    const alert = await screen.findByRole("alert")
    expect(alert.textContent).toMatch(/no respondió/i)
    expect(alert.textContent).not.toContain("secret")
  })

  it("renders partial content while the answer streams", async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => (release = resolve))
    installFakeBackend({
      providerFetch: async () => {
        await gate
        return sseResponse([deltaChunk("Respuesta "), deltaChunk("completa"), "[DONE]"])
      },
    })
    const userEvents = userEvent.setup()
    renderChat()

    await userEvents.type(screen.getByLabelText("Escribe tu mensaje"), "hola{Enter}")
    expect(await screen.findByText("ZenAI está pensando…")).toBeTruthy()
    expect((screen.getByRole("button", { name: /generando/i }) as HTMLButtonElement).disabled).toBe(true)

    release()
    expect(await messageList().findByText("Respuesta completa")).toBeTruthy()
    expect(screen.queryByText("ZenAI está pensando…")).toBeNull()
  })

  it("falls back to the local cache when the server is unreachable", async () => {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify([{ id: "cached", title: "Guardado", messages: [{ id: 1, role: "user", content: "pregunta vieja" }, { id: 2, role: "assistant", content: "respuesta vieja" }], createdAt: 1, updatedAt: 2 }]),
    )
    const backend = installFakeBackend()
    backend.setOffline(true)
    renderChat()

    expect(await messageList().findByText("respuesta vieja")).toBeTruthy()
    expect(await screen.findByText(/No pudimos sincronizar tu historial/)).toBeTruthy()
  })

  it("reuses an empty draft instead of creating duplicate chats", async () => {
    installFakeBackend()
    const userEvents = userEvent.setup()
    renderChat()
    await screen.findByText("¿En qué te ayudo hoy?")

    const newChatButton = () => screen.getAllByRole("button", { name: "Nueva conversación" })[0]!
    await userEvents.click(newChatButton())
    await userEvents.click(newChatButton())
    expect(sidebar().getAllByText("Nueva conversación")).toHaveLength(1)
  })
})

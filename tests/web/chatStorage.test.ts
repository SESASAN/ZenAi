// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
  isPersistedRemotely,
  loadConversations,
  mergeConversations,
  saveConversations,
  type ChatConversation,
} from "@/services/chat/chatStorage"

const conv = (overrides: Partial<ChatConversation>): ChatConversation => ({
  id: "x",
  title: "T",
  messages: [],
  createdAt: 1,
  updatedAt: 1,
  isLoaded: true,
  ...overrides,
})

const summary = (id: string, updatedAt: number, title = id) => ({ id, title, preview: `p-${id}`, createdAt: 1, updatedAt })

beforeEach(() => localStorage.clear())

describe("local cache", () => {
  it("round-trips and migrates legacy numeric message ids", () => {
    localStorage.setItem(
      "zenai-chat-conversations:u1",
      JSON.stringify([{ id: "c1", title: "Old", messages: [{ id: 123, role: "user", content: "hi" }, { role: "bogus" }], createdAt: 1, updatedAt: 2 }]),
    )
    const [loaded] = loadConversations("u1")
    expect(loaded?.messages).toEqual([{ id: "123", role: "user", content: "hi" }])
    expect(loaded?.isLoaded).toBe(true)

    saveConversations("u1", [conv({ id: "z" })])
    expect(loadConversations("u1").map((c) => c.id)).toEqual(["z"])
    expect(loadConversations("someone-else")).toEqual([])
  })

  it("survives corrupt data", () => {
    localStorage.setItem("zenai-chat-conversations:u1", "{not json")
    expect(loadConversations("u1")).toEqual([])
    localStorage.setItem("zenai-chat-conversations:u1", JSON.stringify({ not: "an array" }))
    expect(loadConversations("u1")).toEqual([])
  })
})

describe("mergeConversations", () => {
  const assistant = { id: "a1", role: "assistant" as const, content: "r" }

  it("adds server conversations unknown locally as not loaded", () => {
    const merged = mergeConversations([], [summary("s1", 10)])
    expect(merged).toEqual([expect.objectContaining({ id: "s1", isLoaded: false, preview: "p-s1", messages: [] })])
  })

  it("reuses fresh cached messages and refetches stale ones", () => {
    const fresh = conv({ id: "f", updatedAt: 20, messages: [assistant] })
    const stale = conv({ id: "s", updatedAt: 5, messages: [assistant] })
    const merged = mergeConversations([fresh, stale], [summary("f", 10, "Server title"), summary("s", 10)])
    expect(merged.find((c) => c.id === "f")).toMatchObject({ isLoaded: true, title: "Server title", messages: [assistant] })
    expect(merged.find((c) => c.id === "s")).toMatchObject({ isLoaded: false, updatedAt: 10 })
  })

  it("keeps local drafts but drops chats deleted on another device", () => {
    const draft = conv({ id: "draft" })
    const failedFirstMessage = conv({ id: "failed", messages: [{ id: "u", role: "user", content: "q" }] })
    const deletedElsewhere = conv({ id: "gone", messages: [assistant] })
    const unloadedGone = conv({ id: "unloaded", isLoaded: false })
    const merged = mergeConversations([draft, failedFirstMessage, deletedElsewhere, unloadedGone], [])
    expect(merged.map((c) => c.id)).toEqual(["draft", "failed"])
  })

  it("knows which conversations exist on the server", () => {
    expect(isPersistedRemotely(conv({}))).toBe(false)
    expect(isPersistedRemotely(conv({ isLoaded: false }))).toBe(true)
    expect(isPersistedRemotely(conv({ messages: [assistant] }))).toBe(true)
  })
})

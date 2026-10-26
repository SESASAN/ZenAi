import { expect, test, type Page } from "@playwright/test"
import { mockFirebaseAuth } from "./firebaseAuthMock"

let emailCounter = 0
const uniqueEmail = () => `e2e-${Date.now()}-${emailCounter++}@example.com`

function messageList(page: Page) {
  return page.getByRole("region", { name: "Mensajes" })
}

/** On mobile the sidebar is a drawer. Wait for the (lazy) chat page before checking. */
async function openSidebarIfNeeded(page: Page) {
  await expect(page.getByLabel("Escribe tu mensaje")).toBeVisible()
  const menu = page.getByRole("button", { name: "Abrir menú" })
  if (await menu.isVisible()) await menu.click()
}

async function register(page: Page, email = uniqueEmail()) {
  await page.goto("register")
  await page.getByLabel("Nombre").fill("Ana Prueba")
  await page.getByLabel("Correo electrónico").fill(email)
  await page.getByLabel("Contraseña", { exact: true }).fill("secret123")
  await page.getByLabel("Confirma la contraseña").fill("secret123")
  await page.getByRole("button", { name: "Crear cuenta" }).click()
  await expect(page).toHaveURL(/\/ZenAi\/chat$/)
  return email
}

async function send(page: Page, text: string) {
  const input = page.getByLabel("Escribe tu mensaje")
  await input.fill(text)
  await input.press("Enter")
}

test.describe("public pages", () => {
  test("landing page loads under the GitHub Pages base path", async ({ page }) => {
    const response = await page.goto("./")
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/ZenAI/i)
    await expect(page.getByRole("link", { name: "Crear cuenta" }).first()).toBeVisible()
  })

  test("deep links work after a reload (404.html SPA fallback)", async ({ page }) => {
    const response = await page.goto("login")
    expect(response?.status()).toBe(404) // GitHub Pages serves 404.html...
    await expect(page.getByLabel("Correo electrónico")).toBeVisible() // ...and the SPA renders the route anyway.

    await page.goto("register")
    await expect(page.getByLabel("Nombre")).toBeVisible()
  })

  test("private routes ask to sign in when signed out", async ({ page }) => {
    await mockFirebaseAuth(page)
    await page.goto("chat")
    await expect(page).toHaveURL(/\/ZenAi\/login$/)
  })

  test("unknown routes show the 404 page", async ({ page }) => {
    await mockFirebaseAuth(page)
    await page.goto("no-existe")
    await expect(page.getByRole("heading", { name: "Esta página no existe" })).toBeVisible()
  })

  test("accent selection persists across reloads", async ({ page }) => {
    await mockFirebaseAuth(page)
    await register(page)
    const initial = await page.locator("html").getAttribute("data-theme")
    await page.getByRole("button", { name: /Cambiar color de acento/ }).first().click()
    await page.locator(".theme-palette__swatch:not(.theme-palette__swatch--active)").first().click()
    const chosen = await page.locator("html").getAttribute("data-theme")
    expect(chosen).not.toBe(initial)
    await page.reload()
    await expect(page.locator("html")).toHaveAttribute("data-theme", chosen!)
  })
})

test.describe("chat", () => {
  test("register, chat with a streamed answer, and keep history on the server", async ({ page }) => {
    await mockFirebaseAuth(page)
    await register(page)

    await expect(messageList(page).getByText("¿En qué te ayudo hoy?")).toBeVisible()
    await send(page, "Hola ZenAI, ¿cómo estás?")

    await expect(messageList(page).getByText("Hola ZenAI, ¿cómo estás?")).toBeVisible()
    await expect(page.getByRole("button", { name: "Generando respuesta…" })).toBeVisible()
    await expect(messageList(page).getByText("Echo: Hola ZenAI, ¿cómo estás?")).toBeVisible()
    await expect(page.getByRole("button", { name: "Enviar mensaje" })).toBeVisible()

    // Clear the local cache and reload the deep link: history must come from the server.
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page).toHaveURL(/\/ZenAi\/chat$/)
    await openSidebarIfNeeded(page)
    await page.getByRole("button", { name: /Hola ZenAI, ¿cómo estás\?/ }).first().click()
    await expect(messageList(page).getByText("Echo: Hola ZenAI, ¿cómo estás?")).toBeVisible()
  })

  test("multi-turn conversation sends history and survives a new chat", async ({ page }) => {
    await mockFirebaseAuth(page)
    await register(page)

    await send(page, "Primera")
    await expect(messageList(page).getByText("Echo: Primera")).toBeVisible()
    await send(page, "Segunda")
    await expect(messageList(page).getByText("Echo: Segunda")).toBeVisible()

    await openSidebarIfNeeded(page)
    await page.getByRole("complementary", { name: "Menú" }).getByRole("button", { name: "Nueva conversación" }).first().click()
    await expect(messageList(page).getByText("¿En qué te ayudo hoy?")).toBeVisible()

    await openSidebarIfNeeded(page)
    await page.getByRole("button", { name: /^Primera/ }).first().click()
    await expect(messageList(page).getByText("Echo: Segunda")).toBeVisible()
  })

  test("deleting a chat removes it from the server", async ({ page }) => {
    await mockFirebaseAuth(page)
    await register(page)
    await send(page, "Chat para borrar")
    await expect(messageList(page).getByText("Echo: Chat para borrar")).toBeVisible()

    await openSidebarIfNeeded(page)
    await page.getByRole("button", { name: "Borrar conversación: Chat para borrar" }).click()
    await expect(page.getByRole("button", { name: "Borrar conversación: Chat para borrar" })).toHaveCount(0)

    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await openSidebarIfNeeded(page)
    await expect(page.getByText("Chat para borrar")).toHaveCount(0)
  })

  test("provider errors are shown without internals and the text is restored", async ({ page }) => {
    await mockFirebaseAuth(page)
    await register(page)
    await send(page, "Falla [provider-error]")

    await expect(page.getByRole("alert")).toContainText("no respondió")
    await expect(page.getByRole("alert")).not.toContainText("exploded")
    await expect(page.getByLabel("Escribe tu mensaje")).toHaveValue("Falla [provider-error]")
    await expect(messageList(page).getByText("Falla [provider-error]")).toHaveCount(0)
  })

  test("sign in with an existing account and sign out", async ({ page }) => {
    const email = uniqueEmail()
    await mockFirebaseAuth(page, [{ uid: "existing-user", email, password: "secret123", displayName: "Existing" }])
    await page.goto("login")
    await page.getByLabel("Correo electrónico").fill(email)
    await page.getByLabel("Contraseña").fill("wrong-password")
    await page.getByRole("button", { name: "Iniciar sesión" }).click()
    await expect(page.getByRole("alert")).toBeVisible()

    await page.getByLabel("Contraseña").fill("secret123")
    await page.getByRole("button", { name: "Iniciar sesión" }).click()
    await expect(page).toHaveURL(/\/ZenAi\/chat$/)

    await openSidebarIfNeeded(page)
    await page.getByRole("button", { name: "Cerrar sesión" }).click()
    await expect(page).toHaveURL(/\/ZenAi\/login$/)
  })
})

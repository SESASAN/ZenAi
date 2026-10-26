import { defineConfig, devices } from "@playwright/test"

const PORT = Number(process.env.E2E_PORT ?? 4173)

const e2eEnv = {
  VITE_FIREBASE_API_KEY: "e2e-api-key",
  VITE_FIREBASE_AUTH_DOMAIN: "zenai-e2e.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID: "zenai-e2e",
  VITE_FIREBASE_STORAGE_BUCKET: "zenai-e2e.appspot.com",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "1",
  VITE_FIREBASE_APP_ID: "1:1:web:e2e",
  VITE_CHAT_API_URL: `http://localhost:${PORT}`,
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}/ZenAi/`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "vite build --mode production --outDir dist-e2e --emptyOutDir && tsx e2e/server.ts",
    url: `http://localhost:${PORT}/ZenAi/`,
    env: { ...e2eEnv, E2E_PORT: String(PORT) },
    reuseExistingServer: false,
    timeout: 120_000,
  },
})

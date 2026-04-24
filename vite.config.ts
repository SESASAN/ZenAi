import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig(({ mode }) => ({
  // GitHub Pages sirve la app bajo /<repo>/
  base: mode === "production" ? "/ZenAi/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  /**
   * Vercel Dev (static-build) levanta el frontend como "dev server" y le inyecta PORT.
   * Si Vite ignora PORT (por default usa 5173 y puede auto-incrementar), Vercel falla con:
   * "Failed to detect a server running on port <PORT>".
   */
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    // Si hay PORT (Vercel), NO permitas auto-incrementar: tiene que matchear exactamente.
    strictPort: Boolean(process.env.PORT),
  },
}))

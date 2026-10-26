import { copyFile } from "node:fs/promises"
import path from "node:path"
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"

/**
 * GitHub Pages has no SPA rewrites: a reload on /ZenAi/chat would return 404.
 * Serving a copy of index.html as 404.html lets React Router handle every route.
 */
function githubPagesSpaFallback(): Plugin {
  let outDir = "dist"
  return {
    name: "github-pages-spa-fallback",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      await copyFile(path.join(outDir, "index.html"), path.join(outDir, "404.html"))
    },
  }
}

export default defineConfig(({ mode }) => ({
  // GitHub Pages sirve la app bajo /<repo>/
  base: mode === "production" ? "/ZenAi/" : "/",
  plugins: [react(), githubPagesSpaFallback()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
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

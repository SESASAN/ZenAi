<p align="center">
  <img src="src/assets/icon.svg" width="96" alt="ZenAI — ícono Z" />
</p>

<h1 align="center">ZenAI</h1>

<p align="center">
  App web de chat para interactuar con modelos de IA desde una interfaz clara, moderna y escalable.
</p>

## Qué es

ZenAI es una aplicación web enfocada en una experiencia de chat clara: UI rápida, temas visuales, autenticación con Firebase, respuestas en streaming e historial sincronizado entre dispositivos. Un backend serverless protege las API keys de los proveedores.

## Stack

- **Frontend**: React 19 + TypeScript + Vite (GitHub Pages)
- **Auth**: Firebase Authentication (email/contraseña, Google, GitHub)
- **Backend**: funciones serverless en Vercel (`api/*`) con Firebase Admin
- **Datos**: Firestore (solo desde el backend)
- **Providers LLM**: Groq / Cerebras (streaming)
- **Tests**: Vitest + Testing Library (unit/integración) y Playwright (end-to-end)

## Estructura del repo

```text
api/            # endpoints serverless (Vercel)
  _modules/     # código por módulo: auth, chat, conversations, rateLimit, shared
  _shared/      # firebase-admin, system prompt, wiring de dependencias
docs/           # documentación general
e2e/            # tests end-to-end (Playwright) + servidor de pruebas
src/            # frontend
tests/          # tests unitarios y de integración (Vitest)
firestore.rules # reglas de Firestore (bloquea el acceso directo desde clientes)
```

## API

Todas las rutas requieren `Authorization: Bearer <Firebase ID token>`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/chat` | Envía un turno. Con `"stream": true` responde `application/x-ndjson` (`delta` → `done` / `error`). Guarda solo el último intercambio. |
| `GET` | `/api/conversations` | Lista las conversaciones del usuario. |
| `GET` | `/api/conversations?id=<id>` | Devuelve una conversación con sus mensajes. |
| `DELETE` | `/api/conversations?id=<id>` | Borra una conversación y sus mensajes. |
| `GET` | `/api/health` | Health check. |

Protecciones del backend: modelos permitidos por proveedor, `maxTokens` y `temperature` acotados, mensajes `system` del cliente rechazados, límites de tamaño del historial, rate limit por usuario (Firestore), CORS restringido y errores sin detalles internos.

## Desarrollo local

Requisitos: **Node.js 22+** y **pnpm** (la versión está fijada en `packageManager`; con Corepack: `corepack enable`).

```bash
pnpm install
cp .env.example .env   # completa VITE_FIREBASE_* y, para el backend, las keys
pnpm dev               # frontend en http://localhost:5173
pnpm dev:backend       # (opcional) frontend + /api con `vercel dev` en :3001
```

## Scripts

| Script | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo de Vite |
| `pnpm build` | Type-check + build de producción (genera `404.html` para GitHub Pages) |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript de app, API y tests |
| `pnpm test` | Tests unitarios y de integración (Vitest) |
| `pnpm test:e2e` | Tests end-to-end en Chromium (escritorio y móvil) con Playwright |

Los tests end-to-end no necesitan cuentas reales: usan un build de producción servido como GitHub Pages, los handlers reales de la API con almacenamiento en memoria, un proveedor LLM simulado y Firebase Auth emulado en el navegador. La primera vez ejecuta `pnpm exec playwright install chromium`.

## Variables de entorno

Frontend:
- `VITE_FIREBASE_*`
- `VITE_CHAT_API_URL`

Backend (Vercel):
- `GROQ_API_KEY` / `CEREBRAS_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `ALLOWED_ORIGINS` (opcional): orígenes extra para CORS. `https://sesasan.github.io` y `localhost` ya están permitidos.
- `CHAT_RATE_LIMIT_PER_MINUTE` / `CHAT_RATE_LIMIT_PER_DAY` (opcional, por defecto 10 y 200)

## Deploy

- **Frontend**: GitHub Actions corre lint, type-check, tests y e2e en cada push/PR, y publica en GitHub Pages desde `main`.
- **Backend**: Vercel (`api/*`). Requiere Node 22 (definido en `engines`).
- **Firestore**: publica las reglas con `firebase deploy --only firestore:rules`.

### Datos en Firestore

```text
users/{uid}/conversations/{conversationId}             # título, preview, fechas, último modelo
users/{uid}/conversations/{conversationId}/messages/*  # un documento por mensaje
rateLimits/{uid}                                       # contadores del rate limit
```

Las conversaciones guardadas con el formato anterior (un documento con todo el historial por intercambio) se siguen leyendo correctamente.

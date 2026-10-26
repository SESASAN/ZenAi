# Tech Stack – ZenAI

## 1. Objetivo de este documento

Define el stack tecnológico actual de ZenAI y las reglas técnicas para que cualquier colaborador o IA genere código consistente, seguro y escalable.

ZenAI se construyó en tres fases (HTML + CSS → JavaScript → React + Firebase + Deploy). Las tres están completas; este documento describe el estado actual (Fase 3).

---

## 2. Stack actual

| Capa | Tecnología |
| --- | --- |
| UI | React 19 + TypeScript + Vite, CSS (variables en `:root`, CSS Modules) |
| Routing | React Router (BrowserRouter con `basename` + `404.html` para GitHub Pages) |
| Auth | Firebase Authentication (email/contraseña, Google, GitHub) |
| Backend | Funciones serverless en Vercel (`api/*`), Node 22 |
| Datos | Firestore, solo vía Firebase Admin desde el backend |
| LLM | Groq (por defecto) y Cerebras, API compatible con OpenAI, en streaming |
| Tests | Vitest + Testing Library + jsdom; Playwright para e2e |
| CI/CD | GitHub Actions → GitHub Pages; Vercel para la API |

---

## 3. Frontend (`src/`)

- `pages/`: páginas (landing, login, registro, chat), cargadas en diferido.
- `components/`: componentes de UI (chat, layout, tema).
- `hooks/useChat.ts`: estado del chat (envío con streaming, sincronización, borrado). La UI no contiene lógica de red.
- `services/chat/`: cliente HTTP (`apiClient`, `chatApi`, `conversationsApi`) y caché local (`chatStorage`).
- `services/firebase/`: inicialización y contexto de autenticación. El cliente **no** usa el SDK de Firestore.

### Historial de conversaciones
- **Fuente de verdad**: Firestore (a través de `/api/conversations`).
- **Caché local**: `localStorage` por usuario, para mostrar todo al instante y seguir funcionando sin conexión.
- Al iniciar se combinan la caché y la lista del servidor; los mensajes de una conversación se descargan al abrirla si la caché está desactualizada.

### Streaming
- El cliente envía `stream: true` y lee `application/x-ndjson`: eventos `delta`, `done` o `error`.
- Mientras llega la respuesta se muestra el texto parcial; si falla, se revierte el turno y el texto vuelve al campo de entrada.

---

## 4. Backend (`api/`)

Arquitectura por módulos con capas `domain` / `application` / `infrastructure` / `presentation`:

- `auth`: verificación del Firebase ID token.
- `chat`: validación del request, ejecución del turno, cliente de streaming del proveedor.
- `conversations`: repositorio (Firestore / memoria) y endpoints de lectura y borrado.
- `rateLimit`: límite por usuario (ventanas de 1 minuto y 24 horas).
- `shared/http`: CORS, respuestas JSON y mapeo de errores.

Las dependencias (repositorios, verificador de tokens, proveedor) se inyectan, así que todo el backend se prueba sin Firebase ni red.

### Reglas de seguridad del endpoint de chat
- Requiere `Authorization: Bearer <ID token>`.
- Solo acepta mensajes `user` / `assistant`; el system prompt lo agrega siempre el servidor.
- Modelos en lista permitida (`chat.limits.ts`), `maxTokens` ≤ 2048, `temperature` entre 0 y 1.5.
- Máximo 40 mensajes, 8.000 caracteres por mensaje y 60.000 en total.
- Rate limit por usuario configurable (`CHAT_RATE_LIMIT_PER_MINUTE`, `CHAT_RATE_LIMIT_PER_DAY`).
- CORS: solo el dominio de producción, `localhost` y `ALLOWED_ORIGINS`.
- Los errores al cliente nunca incluyen detalles internos; se registran en los logs.

### Modelo de datos (Firestore)
```text
users/{uid}/conversations/{conversationId}
  title, preview, createdAt, updatedAt, lastProvider, lastModel, messageCount
users/{uid}/conversations/{conversationId}/messages/{messageId}
  role, content, createdAt, createdAtMs, [provider, model, usage]
rateLimits/{uid}
```
Se guarda solo el último intercambio de cada turno. Los documentos con el formato anterior se siguen leyendo. `firestore.rules` bloquea el acceso directo desde clientes.

---

## 5. Decisiones técnicas clave (normas del proyecto)

1. **No exponer secretos en el frontend**: las API keys viven solo en el backend.
2. **Mobile first**: el layout base está pensado para pantallas pequeñas; la barra lateral es un drawer en móvil.
3. **Accesibilidad**: labels asociados a inputs, roles y `aria-*` en el chat, contraste y navegación por teclado.
4. **Render seguro**: el contenido del usuario se muestra como texto; el del asistente con `react-markdown` (sin HTML crudo).
5. **Separación de capas**: UI, estado (hooks), servicios de red y backend por módulos.
6. **Manejo explícito de errores**: 400/401/403/404/429/5xx con mensajes claros y sin filtrar detalles internos.
7. **Documentación como fuente de verdad**: cualquier cambio importante se refleja en `/docs` y en el README.

---

## 6. Testing y calidad

- `pnpm lint` y `pnpm typecheck` (app, API y tests).
- `pnpm test`: Vitest. Validaciones, rate limit, CORS, parser SSE, handlers HTTP con dependencias en memoria y la página de chat renderizada contra los handlers reales.
- `pnpm test:e2e`: Playwright en Chromium (escritorio y móvil). Build de producción servido como GitHub Pages, API real en memoria, proveedor LLM simulado y Firebase Auth emulado.
- CI ejecuta todo lo anterior antes de publicar.

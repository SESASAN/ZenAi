# Tech Stack – ZenAI

## 1. Objetivo de este documento

Este documento define el stack tecnológico de ZenAI por fases (curso incremental) y establece reglas técnicas para que cualquier colaborador o IA pueda generar código consistente, seguro y escalable.

ZenAI se construirá en tres fases:

- Fase 1: HTML + CSS + Git (estructura, maquetación y documentación)
- Fase 2: JavaScript (interactividad, consumo de API, estados y UX dinámica)
- Fase 3: React + Firebase + Deploy (componentización, persistencia, autenticación y despliegue)

---

## 2. Stack por Fase

### 2.1 Fase 1 – Estructura y Maquetación (HTML + CSS)

#### HTML5 (Semántica y Accesibilidad)
**Uso:**
- Definir la estructura del layout del chat (header, sidebar, main chat, input bar).
- Establecer una base semántica clara y mantenible.

**Requisitos técnicos:**
- Usar etiquetas semánticas:
  - `<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`
- Separar claramente:
  - Contenedor de conversación (lista de mensajes)
  - Controles de entrada (input + botón)
  - Panel lateral (sidebar)
- Incluir accesibilidad mínima:
  - `aria-label` en botones e inputs
  - `role="log"` para el contenedor de mensajes (opcional) para lectores de pantalla
  - `button type="submit"` si se usa formulario
- Incluir meta viewport:
  - `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

**Estructura recomendada (a nivel DOM):**
- Un contenedor raíz `.app`
- Sidebar `.sidebar`
- Chat `.chat`
  - `.chat-header`
  - `.message-list`
  - `.composer` (barra inferior)

---

#### CSS3 (Diseño Neon-Inspired y Responsive)
**Uso:**
- Implementar el sistema de diseño definido en `docs/design_system.md`.
- Construir una UI responsiva mobile-first.
- Asegurar consistencia: espaciado, tipografía, colores y estados.

**Requisitos técnicos:**
- Usar variables CSS en `:root` para todo lo repetible:
  - Colores, sombras glow, radios, tamaños.
- Usar Flexbox/Grid:
  - Flexbox para composición vertical del chat y alineación de burbujas.
  - Grid (opcional) para layout general (sidebar + chat) en desktop.
- Implementar responsive con media queries:
  - Mobile default
  - Desktop con sidebar visible a partir de `min-width: 1024px` (recomendado)
- Evitar dependencias externas en Fase 1 (no frameworks CSS).

**Patrones técnicos de estilo:**
- `box-shadow` para efecto glow (sutil por defecto, más intenso en hover).
- Bordes neón con opacidad controlada.
- Scroll controlado en `.message-list`:
  - `overflow-y: auto`
  - `scroll-behavior: smooth` (opcional)

---

#### Git y GitHub (Control de Versiones)
**Uso:**
- Mantener historial de cambios claro y profesional.
- Permitir revisión incremental por fases.

**Requisitos técnicos:**
- Commits descriptivos y atómicos siguiendo un patrón similar a Conventional Commits:
  - `chore: ...`
  - `docs: ...`
  - `feat: ...`
  - `style: ...`
  - `fix: ...`
- Evitar un solo commit con todo el trabajo.
- Incluir `.gitignore` con:
  - `.DS_Store`
  - `Thumbs.db`
  - `node_modules/` (para fases futuras)

---

### 2.2 Fase 2 – Interactividad (JavaScript)

#### JavaScript (Vanilla) – DOM, Estado y Networking
**Uso:**
- Capturar la entrada del usuario.
- Renderizar mensajes dinámicamente en el DOM.
- Consumir una API de modelo de lenguaje (Groq u otra).
- Manejar estados de UX: loading, error, rate limit, etc.
- Implementar almacenamiento local inicial (LocalStorage) antes de Firebase.

**Arquitectura recomendada (sin framework):**
- `app.js` como entry point.
- Módulos por responsabilidad:
  - `ui.js` → render y helpers de UI
  - `api.js` → llamada a API, normalización de respuesta
  - `state.js` → estado de conversación en memoria
  - `storage.js` → localStorage (fase 2)

**Estado mínimo que debe existir:**
- `messages[]`: array de objetos `{ id, role, content, createdAt }`
  - `role`: `"user"` o `"assistant"`
- `isLoading`: boolean
- `error`: objeto o string (si existe)

**Validación y seguridad básica:**
- Sanitización básica para evitar inyección HTML al renderizar (usar `textContent` en lugar de `innerHTML` para contenido de mensajes).
- Limitar longitud de mensaje (ej: 2000 caracteres).
- Prevenir envíos vacíos (trim).

---

#### Consumo de API (Groq) – Enfoque Técnico
**Objetivo:**
Integrar un endpoint de chat completions para generar respuestas.

**Regla crítica de seguridad:**
- La API Key **NO debe** estar en el frontend.
- La integración debe hacerse mediante:
  - Un backend propio (Node/Express) o
  - Funciones serverless (Vercel/Netlify/Cloudflare) o
  - Un proxy seguro que inyecte la key en el servidor

**Manejo de errores obligatorio:**
- `401/403`: credenciales inválidas → mostrar mensaje y bloquear reintentos.
- `429`: rate limit → mostrar “Demasiadas solicitudes, intenta en X segundos”.
- `5xx`: error de servidor → mensaje de fallback y reintento manual.

**Estados de UX:**
- Mostrar indicador “ZenAI está escribiendo…” mientras `isLoading = true`.
- Deshabilitar botón de enviar durante loading si se desea.
- Permitir cancelar (fase opcional) con `AbortController`.

**Optimización opcional:**
- Streaming de tokens si el proveedor lo soporta, para respuestas tipo “en tiempo real”.

---

#### Persistencia inicial (LocalStorage)
**Uso:**
- Guardar conversación y restaurarla al recargar.

**Reglas técnicas:**
- Guardar `messages[]` serializado con `JSON.stringify`.
- Versionar el schema (opcional):
  - `zenai_messages_v1`
- Manejar fallback si el JSON está corrupto.

---

### 2.3 Fase 3 – Arquitectura Moderna (React + Firebase + Deploy)

#### React (UI por Componentes)
**Uso:**
- Convertir la UI a componentes reutilizables.
- Manejar estado de manera predecible.
- Mejorar escalabilidad y mantenibilidad.

**Componentes propuestos:**
- `<AppLayout />`
- `<Sidebar />`
- `<ChatWindow />`
- `<MessageList />`
- `<MessageBubble role="user|assistant" />`
- `<Composer />`
- `<TypingIndicator />`
- `<ModelSelector />` (futuro)
- `<Toast />` o `<Alert />` (errores)

**Estado recomendado:**
- Estado global (según complejidad):
  - Context API (si es pequeño)
  - Zustand/Redux (si crece mucho)
- Separación de concerns:
  - UI state vs server state

**Buenas prácticas:**
- Mantener mensajes como fuente de verdad.
- Evitar lógica de negocio mezclada dentro de componentes.
- Hooks para lógica:
  - `useChat()`, `useGroqClient()`, `usePersistedState()`

---

#### Firebase (Persistencia + Autenticación)
**Uso:**
- Guardar conversaciones por usuario.
- Permitir login y mantener historial.

**Servicios propuestos:**
- Firebase Authentication:
  - Email/Password o Google Sign-In
- Firestore Database:
  - Colecciones recomendadas:
    - `users/{userId}`
    - `chats/{chatId}`
    - `chats/{chatId}/messages/{messageId}`

**Modelo de datos sugerido:**
- Chat:
  - `id`, `userId`, `title`, `createdAt`, `updatedAt`
- Message:
  - `id`, `chatId`, `role`, `content`, `createdAt`

**Reglas de seguridad (indispensable):**
- Un usuario solo puede leer/escribir sus propios chats:
  - `request.auth.uid == resource.data.userId`
- Validaciones de tamaño:
  - limitar `content` por longitud.

---

#### Deploy (Producción)
**Plataformas recomendadas:**
- Vercel / Netlify / Cloudflare Pages para frontend
- Serverless Functions (misma plataforma) para proxy de API

**Consideraciones técnicas:**
- Variables de entorno para keys:
  - `GROQ_API_KEY`
  - `FIREBASE_*`
- Evitar exponer secretos en repositorio.
- Configurar CORS correctamente si hay backend.

---

## 3. Decisiones Técnicas Clave (Normas del Proyecto)

1. **No exponer secretos en el frontend**: toda API key va en server o functions.
2. **Mobile First**: layout base pensado para pantallas pequeñas.
3. **Accesibilidad mínima**: roles, labels, contraste y navegación.
4. **Render seguro de mensajes**: usar `textContent`, no `innerHTML`.
5. **Estructura escalable**: separar UI, estado y capa API.
6. **Manejo explícito de errores**: 401/403/429/5xx con mensajes claros.
7. **Documentación como fuente de verdad**: cualquier cambio importante debe reflejarse en `/docs`.

---

## 4. Estructura de Archivos Esperada (Fase 1 → Fase 3)

### Fase 1
- `index.html`
- `css/styles.css`
- `assets/*`
- `docs/*`

### Fase 2 (propuesta)
- `js/app.js`
- `js/ui.js`
- `js/api.js`
- `js/state.js`
- `js/storage.js`

### Fase 3 (propuesta)
- `src/components/*`
- `src/hooks/*`
- `src/services/*`
- `src/pages/*` (si aplica)
- Backend serverless (`api/*`)

---

## 5. Testing y Calidad (Opcional pero recomendado)

### Fase 2
- Pruebas manuales de flujos críticos:
  - Enviar mensaje
  - Renderizado
  - Manejo de error
  - Rate limit

### Fase 3
- Unit testing (opcional):
  - Vitest / Jest
- E2E (opcional):
  - Playwright

---

## 6. Checklist de Cumplimiento (para el taller)

- README con descripción y cómo ejecutar.
- Estructura profesional del repositorio.
- `/docs` contiene:
  - `project_scope.md`
  - `design_system.md`
  - `tech_stack.md`
- Commits ordenados y descriptivos.

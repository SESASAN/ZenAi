# ZenAI

ZenAI es una aplicación web conversacional orientada a interactuar con modelos de inteligencia artificial desde una interfaz clara, moderna y escalable.

El proyecto está construido con una base **frontend + backend dentro del mismo repositorio**, con separación de responsabilidades entre UI, lógica de chat e integración con proveedores LLM.

## Objetivo

ZenAI busca ofrecer una experiencia de chat donde el usuario pueda:

- enviar mensajes desde una interfaz simple y cuidada,
- recibir respuestas generadas por un modelo de IA,
- evolucionar hacia historial, autenticación, persistencia y selección de modelos,
- mantener una arquitectura entendible y preparada para crecer.

## Stack principal

- **React**
- **TypeScript**
- **Vite**
- **Firebase**
- **Groq / Cerebras** como proveedores LLM
- **CSS Modules**

## Arquitectura

El proyecto sigue un enfoque de **monolito modular**.

### Frontend

El frontend vive en `src/` y se encarga de:

- renderizar la interfaz conversacional,
- manejar estado local de la UI,
- componer componentes reutilizables,
- autenticación con Google (Firebase Auth),
- conectarse con el backend mediante un contrato HTTP (con `Authorization: Bearer <idToken>`).

### Backend

El backend vive en `functions/` y concentra:

- validación de requests,
- orquestación del flujo de chat,
- integración con proveedores de IA,
- manejo de errores,
- verificación del token de Firebase (ID token),
- persistencia de conversaciones en Cloud Firestore.

> Nota: para desarrollo local el backend corre como servidor Node (`functions/src/local-server.ts`).
> Para despliegue en Firebase se expone como HTTP Function (`functions/src/chat/presentation/http/chat.handler.ts`).

### Principios aplicados

- separación entre infraestructura y UI,
- responsabilidades explícitas,
- contrato estable entre cliente y backend,
- desacople del proveedor LLM,
- evolución gradual sin romper la base.

## Estructura del proyecto

```bash
.
├── docs/
├── functions/
│   └── src/
│       ├── chat/
│       │   ├── application/
│       │   ├── domain/
│       │   ├── infrastructure/
│       │   └── presentation/
│       └── local-server.ts
├── skills/
├── src/
│   ├── components/
│   ├── services/
│   ├── App.tsx
│   └── main.tsx
├── firebase.json
├── package.json
└── README.md
```

## Frontend

La interfaz está organizada con enfoque de **component colocation**, donde cada componente mantiene cerca sus tipos, constantes y estilos.

Patrón habitual:

```bash
Componente/
├── Componente.tsx
├── Componente.module.css
├── Componente.types.ts
├── Componente.constants.ts
└── index.ts
```

## Backend de chat

El backend expone un flujo orientado a chat y soporta una abstracción de proveedores compatible con Groq y Cerebras.

### Responsabilidades del backend

- recibir mensajes del frontend,
- validar el payload,
- elegir el provider configurado,
- ejecutar la generación de respuesta,
- devolver un formato homogéneo al cliente,
- persistir la conversación en Firestore por usuario autenticado.

### Persistencia en Firestore (modelo de datos)

Firestore crea colecciones/documentos cuando se escribe el primer documento.

ZenAI persiste en:

```text
users/{uid}/conversations/{conversationId}
users/{uid}/conversations/{conversationId}/messages/{messageId}
```

### Endpoint principal

- `POST /chat`

### Endpoint local de salud

- `GET /health`

## Ejecución local

### Frontend

Desde la raíz del proyecto:

```bash
npm install
npm run dev
```

El frontend corre en `http://localhost:5173` (Vite por defecto).

### Backend local

Desde `functions/`:

```bash
npm install
npm run dev:local
```

El backend local queda disponible en:

```bash
http://localhost:3001
```

### Requisitos para que se guarde en Firestore

Para que el backend local pueda escribir en tu proyecto Firebase (Firestore) necesitás:

1) Tener **Cloud Firestore habilitado** en el proyecto.
2) Tener **Firebase Auth (Google)** habilitado y poder iniciar sesión desde la UI.
3) Configurar credenciales del **Firebase Admin SDK** para el backend local (Service Account JSON) vía `GOOGLE_APPLICATION_CREDENTIALS`.

## Variables de entorno

El backend local utiliza credenciales desde el archivo `.env` de la raíz del proyecto.

Variables esperadas:

```bash
GROQ_API_KEY=
CEREBRAS_API_KEY=
CHAT_BACKEND_PORT=3001

# Credenciales de servidor para que firebase-admin pueda escribir en Firestore (DEV local)
# 1) Firebase Console → Project settings → Service accounts → Generate new private key
# 2) Guardá el JSON fuera del repo
GOOGLE_APPLICATION_CREDENTIALS=C:\Users\TU_USUARIO\secrets\zenai.json
```

La configuración del frontend para Firebase utiliza variables `VITE_FIREBASE_*` (config web) para Auth/Firestore del cliente:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> Importante: `VITE_FIREBASE_*` NO reemplaza `GOOGLE_APPLICATION_CREDENTIALS`.
> El backend usa `firebase-admin` y necesita credenciales de servidor.

Opcional (frontend → URL backend):

```bash
VITE_CHAT_API_URL=http://localhost:3001
```

## Cómo funciona (flujo end-to-end)

1) El usuario inicia sesión con Google en la UI (Firebase Auth).
2) El frontend obtiene un **ID token** (`user.getIdToken()`).
3) El frontend llama `POST /chat` al backend con:
   - payload `{ conversationId, messages, provider... }`
   - header `Authorization: Bearer <idToken>`
4) El backend verifica el token con `firebase-admin` y obtiene el `uid`.
5) El backend llama al provider LLM (Groq/Cerebras).
6) El backend guarda el intercambio en Firestore bajo `users/{uid}/...`.
7) El backend devuelve el completion al frontend.

## Ejemplo de request

```json
{
  "provider": "groq",
  "messages": [
    { "role": "system", "content": "Sos un asistente útil." },
    { "role": "user", "content": "Necesito ayuda con mi proyecto." }
  ]
}
```

## Ejemplo de response

```json
{
  "message": {
    "role": "assistant",
    "content": "Claro. Contame qué parte querés resolver primero."
  },
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "usage": {
    "promptTokens": 0,
    "completionTokens": 0,
    "totalTokens": 0
  }
}
```

## Documentación complementaria

- [`docs/backend-chat.md`](docs/backend-chat.md): contrato y ejecución del backend de chat.
- [`skills/firebase/SKILL.md`](skills/firebase/SKILL.md): guía del proyecto para integración con Firebase.

## Roadmap

- historial completo en Firestore (listar conversaciones + mensajes desde backend),
- historial de chats,
- selector de modelo y proveedor,
- streaming de respuestas,
- estrategia de deploy del backend.

## Filosofía del proyecto

ZenAI prioriza:

- fundamentos antes que parches rápidos,
- diseño claro antes que acoplamiento accidental,
- arquitectura entendible antes que complejidad prematura.

Porque sí: hacer que algo funcione importa, pero hacerlo de forma que **se pueda mantener** importa más.

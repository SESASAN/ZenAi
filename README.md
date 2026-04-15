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
- conectarse con el backend mediante un contrato HTTP.

### Backend

El backend vive en `functions/` y concentra:

- validación de requests,
- orquestación del flujo de chat,
- integración con proveedores de IA,
- manejo de errores,
- persistencia opcional de conversaciones.

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
- persistir la conversación cuando corresponda.

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

## Variables de entorno

El backend local utiliza credenciales desde el archivo `.env` de la raíz del proyecto.

Variables esperadas:

```bash
GROQ_API_KEY=
CEREBRAS_API_KEY=
```

La configuración del frontend para Firebase utiliza las variables `VITE_FIREBASE_*`.

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

- conexión completa del frontend al backend real,
- persistencia de conversaciones,
- autenticación de usuarios,
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

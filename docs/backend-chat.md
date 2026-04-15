# Backend de chat IA

Este proyecto ahora tiene una base de **backend monolito modular** usando **Firebase Functions** dentro del mismo repositorio.

## Estructura

```text
functions/
  src/
    chat/
      application/
      domain/
      infrastructure/
      presentation/
    shared/
```

## Endpoint

- Function HTTP: `chat`
- Región: `us-central1`

## Ejecución local sin Firebase Functions

Si querés validar el backend en tu PC antes de deployar, podés correr un servidor local reutilizando el mismo core del chat:

```bash
cd functions
npm install
npm run dev:local
```

Por defecto levanta en `http://localhost:3001` y toma `GROQ_API_KEY` / `CEREBRAS_API_KEY` desde el archivo raíz `../.env`.

### Rutas locales

- `GET /health`
- `POST /chat`

### Request

```json
{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "conversationId": "chat-123",
  "messages": [
    { "role": "system", "content": "Sos un asistente útil." },
    { "role": "user", "content": "Hola, necesito ayuda." }
  ]
}
```

### Response

```json
{
  "message": {
    "role": "assistant",
    "content": "Hola, claro. Contame qué necesitás."
  },
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "usage": {
    "promptTokens": 20,
    "completionTokens": 15,
    "totalTokens": 35
  }
}
```

## Secrets requeridos

Configuralos en Firebase antes de deployar:

```bash
firebase functions:secrets:set GROQ_API_KEY
firebase functions:secrets:set CEREBRAS_API_KEY
```

Podés configurar uno o ambos. Si no mandás `provider`, el backend usa `groq` por defecto.

## Decisión arquitectónica

- El frontend **no** llama a Groq/Cerebras directo.
- Las API keys quedan en Functions.
- La UI habla con un contrato estable HTTP.
- Si llega `conversationId`, se guarda el intercambio en Firestore.

## Próximo paso recomendado

Conectar `src/App.tsx` a esta function y sacar la respuesta mockeada.

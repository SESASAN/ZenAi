---
name: firebase
description: >
  Guía para integrar Firebase en aplicaciones frontend con React + Vite,
  priorizando SDK modular, configuración por variables de entorno y separación
  entre inicialización, acceso a datos y consumo desde UI.
  Trigger: cuando el usuario pida configurar Firebase, Firestore, Auth,
  Storage o mejorar integración Firebase en este proyecto.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Configurar Firebase en apps React/Vite.
- Agregar o refactorizar Firestore, Auth o Storage.
- Revisar uso de variables `VITE_FIREBASE_*`.
- Separar configuración Firebase de servicios y componentes UI.

## Critical Patterns

- Usar SIEMPRE SDK modular (`firebase/app`, `firebase/firestore`, etc.); no compat.
- Mantener la inicialización en `src/services/firebase/firebaseConfig.ts`.
- No mezclar llamadas directas a Firestore dentro de componentes grandes; crear servicios/repositories por feature.
- Leer credenciales desde `import.meta.env`; nunca hardcodear secretos.
- Exportar instancias compartidas (`app`, `db`, `auth`, `storage`) desde un único punto de composición.
- Validar que las env vars requeridas existan antes de inicializar para evitar fallos silenciosos.
- Tratar Firebase como infraestructura: la UI consume casos de uso/servicios, no SDK crudo.

## Decision Guide

| Necesidad | Solución recomendada | Tradeoff |
| --- | --- | --- |
| Solo persistencia documental | Firestore | Simple y flexible, pero requiere modelado explícito |
| Login de usuarios | Firebase Auth | Muy rápido de integrar, pero acopla reglas al ecosistema Firebase |
| Archivos | Firebase Storage | Excelente para uploads, pero exige gobernar permisos con reglas |
| Acceso desde UI | Servicio por feature | Más archivos, pero menos acoplamiento y mejor testabilidad |

## Suggested Structure

```text
src/
  services/
    firebase/
      firebaseConfig.ts
      auth.ts
      firestore.ts
  features/
    <feature>/
      services/
      hooks/
      components/
```

## Code Examples

### Inicialización base

```ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### Servicio Firestore por feature

```ts
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase/firebaseConfig";

const notesCollection = collection(db, "notes");

export async function listNotes() {
  const snapshot = await getDocs(notesCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createNote(input: { title: string }) {
  return addDoc(notesCollection, input);
}
```

### Guard clause para env vars

```ts
const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

for (const key of requiredEnvVars) {
  if (!import.meta.env[key]) {
    throw new Error(`Missing Firebase env var: ${key}`);
  }
}
```

## Commands

```bash
npm install firebase
npm run lint
```

## Resources

- **Configuración actual**: `src/services/firebase/firebaseConfig.ts`

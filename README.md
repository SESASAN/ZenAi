# ZenAI

ZenAI es una interfaz web de chat diseñada para interactuar con modelos de Inteligencia Artificial de manera simple, moderna y escalable.

Este proyecto forma parte del Proyecto Final del diplomado en Desarrollo Fullstack y se desarrolla de forma incremental, evolucionando desde una maqueta estática hasta una aplicación completa basada en componentes.

---

## Estado actual del proyecto

Actualmente el proyecto se encuentra en la fase de componentización con React y TypeScript. En esta etapa ya se implementaron:

- Estructura base en React
- Sistema de componentes reutilizables
- Interfaz inicial de chat funcional (sin integración de API)
- Navbar con interacción visual
- Uso de CSS Modules para encapsulación de estilos
- Organización basada en Component Colocation

---

## Descripción del Proyecto

ZenAI es una aplicación web tipo chat que permite a los usuarios enviar mensajes y recibir respuestas generadas por un modelo de inteligencia artificial.

En esta fase:

- Se construye la base de la interfaz conversacional
- Se implementa el flujo de mensajes (usuario → sistema)
- Se define una arquitectura escalable para futuras integraciones

La aplicación está diseñada bajo:

- enfoque Mobile First
- arquitectura modular
- separación clara de responsabilidades

---

## Características actuales

- Interfaz de chat conversacional
- Burbujas de mensaje diferenciadas (usuario / sistema)
- Input de texto con botón de envío reutilizable
- Render dinámico de mensajes con useState
- Navbar con interacción visual
- Estilos encapsulados con CSS Modules

---

## Características planeadas

- Integración con API de modelos de lenguaje
- Streaming de respuestas en tiempo real
- Persistencia de conversaciones
- Autenticación de usuarios
- Selector de modelo
- Historial de chats
- Personalización de la interfaz

---

## Estructura del Proyecto

```bash
src/
├── assets/
├── components/
├── styles/
├── App.tsx
├── main.tsx
```
Cada componente sigue el patrón:
```bash
Componente/
├── Componente.tsx
├── Componente.module.css
├── Componente.types.ts
├── Componente.constants.ts
└── index.ts
```

---

## Tecnologías Utilizadas
- React
- TypeScript
- Vite
- CSS Modules
- Git y GitHub

---

## Instalación y Uso
Clonar el repositorio:
```bash
git clone https://github.com/TU-USUARIO/zenai.git
```
Entrar al proyecto:
```bash
cd zenai
```
Instalar dependencias:
```bash
npm install
```
Ejecutar el proyecto:
```bash
npm run dev
```

---

## Enfoque de arquitectura

El proyecto utiliza:

- Component Colocation: cada componente contiene sus estilos, tipos y constantes
- Flujo de datos unidireccional
- Separación entre estado local y estado global
- Componentes reutilizables y desacoplados

Esto permite escalar el proyecto hacia una aplicación más compleja sin perder organización.

Roadmap del Proyecto
- Fase 1: Maquetación base
- Fase 2: Interactividad básica
- Fase 3: React y TypeScript (actual)
- Fase 4: Integración con API de IA
- Fase 5: Persistencia y autenticación
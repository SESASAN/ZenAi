# Project Scope – ZenAI

## 1. Descripción General

ZenAI es una aplicación web de tipo chat conversacional diseñada para permitir a los usuarios interactuar con modelos de Inteligencia Artificial mediante una interfaz moderna, intuitiva y escalable.

El objetivo principal del proyecto es construir una plataforma de conversación tipo mensajería (similar a WhatsApp o ChatGPT) donde el usuario pueda enviar mensajes y recibir respuestas generadas por un modelo de lenguaje.

En su primera fase, ZenAI se enfocará en la maquetación estructural y visual (HTML y CSS), preparando una base sólida para futuras fases donde se integrará lógica con JavaScript, consumo de APIs externas y almacenamiento de datos.

---

## 2. Problema que Resuelve

Actualmente, muchas herramientas de IA presentan interfaces complejas o sobrecargadas de opciones. ZenAI busca:

- Ofrecer una experiencia minimalista y centrada en la conversación.
- Reducir la fricción entre el usuario y el modelo de IA.
- Proporcionar una interfaz clara, limpia y enfocada en productividad.

---

## 3. Usuario Objetivo

### Perfil Principal
- Estudiantes y desarrolladores que desean interactuar con modelos de IA.
- Personas interesadas en productividad asistida por IA.
- Usuarios entre 16 y 40 años familiarizados con aplicaciones de mensajería.

### Nivel Técnico del Usuario
- No se requiere conocimiento técnico.
- Debe ser usable por cualquier persona con experiencia básica en navegación web.

---

## 4. Objetivos del Producto

### Objetivo General
Construir una interfaz web conversacional profesional, escalable y preparada para integrar modelos de IA externos.

### Objetivos Específicos

1. Crear una estructura semántica clara y organizada.
2. Diseñar una interfaz de chat intuitiva.
3. Permitir interacción conversacional fluida.
4. Preparar arquitectura escalable para integración futura con:
   - API de modelos de lenguaje.
   - Base de datos (Firebase).
   - Autenticación de usuarios.

---

## 5. Funcionalidades Principales (Core Features)

### Fase 1 – Maquetación (HTML + CSS)

1. **Interfaz de Chat**
   - Área principal donde se visualizan los mensajes.
   - Burbujas diferenciadas para:
     - Usuario (alineadas a la derecha).
     - IA (alineadas a la izquierda).

2. **Campo de Entrada**
   - Input de texto fijo en la parte inferior.
   - Botón de envío claramente visible.
   - Diseño responsive.

3. **Header**
   - Nombre del proyecto (ZenAI).
   - Indicador de estado (ej: “Online” o “Conectado”).

4. **Sidebar (estructura base)**
   - Espacio reservado para:
     - Lista de conversaciones (futuro).
     - Configuración.
     - Selector de modelo.

5. **Estado de Escritura (Visual)**
   - Indicador tipo “ZenAI está escribiendo…” (solo visual en Fase 1).

---

### Fase 2 – Interactividad (JavaScript)

1. Captura del mensaje del usuario.
2. Renderizado dinámico de mensajes en el DOM.
3. Integración con API externa de modelo de lenguaje.
4. Manejo de estados:
   - Cargando
   - Error
   - Límite de solicitudes (rate limit)

---

### Fase 3 – Escalabilidad (React + Firebase)

1. Componentización completa del chat.
2. Persistencia de conversaciones en base de datos.
3. Autenticación de usuarios.
4. Historial de conversaciones.
5. Soporte para múltiples chats simultáneos.

---

## 6. Reglas de Negocio

1. La aplicación seguirá el enfoque **Mobile First**.
2. No se expondrán claves privadas de API en el frontend.
3. La experiencia debe ser rápida y minimalista.
4. El diseño debe priorizar legibilidad y contraste.
5. El usuario podrá enviar múltiples mensajes consecutivos.
6. En caso de error de conexión, se mostrará un mensaje claro y amigable.
7. En la primera versión no se requerirá registro obligatorio.

---

## 7. Requerimientos Funcionales

- El sistema debe permitir ingresar texto en un campo.
- El sistema debe mostrar mensajes en orden cronológico.
- El sistema debe diferenciar visualmente entre usuario e IA.
- El sistema debe ser completamente responsive.
- El sistema debe mantener coherencia visual en todos los componentes.

---

## 8. Requerimientos No Funcionales

- Diseño limpio y profesional.
- Código organizado y semántico.
- Escalabilidad para futuras tecnologías.
- Compatibilidad con navegadores modernos.
- Tiempo de carga rápido.
- Arquitectura preparada para crecimiento modular.

---

## 9. Alcance del Proyecto

### Incluido en Fase 1
- Maquetación completa del chat.
- Diseño visual profesional.
- Documentación técnica detallada.
- Estructura base del proyecto.

### No Incluido en Fase 1
- Integración real con API.
- Autenticación.
- Base de datos.
- Despliegue en producción.

---

## 10. Visión a Futuro

ZenAI está concebido como una plataforma escalable que podría evolucionar hacia:

- Comparación entre múltiples modelos de IA.
- Modo oscuro y claro configurable.
- Exportación de conversaciones.
- Panel de configuración avanzada.
- Soporte para archivos adjuntos.
- Implementación como aplicación web progresiva (PWA).

---

## 11. Diferenciador del Proyecto

ZenAI no busca ser solo otro chat con IA. Su enfoque es:

- Simplicidad radical.
- Diseño limpio.
- Escalabilidad técnica real.
- Arquitectura preparada para crecimiento profesional.

---

## 12. Métricas de Éxito

- Interfaz intuitiva sin curva de aprendizaje.
- Diseño responsive funcional.
- Código organizado y modular.
- Base sólida para integración futura con API externa.
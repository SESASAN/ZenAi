# Design System – ZenAI

## 1. Filosofía Visual

ZenAI adopta una estética futurista inspirada en la película Tron.

El diseño se basa en:

- Fondos oscuros profundos
- Líneas y bordes luminosos
- Colores neón
- Alto contraste
- Sensación tecnológica y minimalista

La interfaz debe transmitir:

- Precisión
- Energía digital
- Futurismo limpio
- Enfoque absoluto en la conversación

---

## 2. Enfoque de Diseño

- Dark Mode por defecto
- Mobile First
- Minimalismo tecnológico
- Uso estratégico de efectos glow
- Interfaz centrada en el chat

---

## 3. Paleta de Colores (Tron Inspired)

### Fondo Base

- Fondo principal: #0A0F1F
- Fondo secundario: #111827
- Superficie elevada (cards/chat): #0F172A

### Colores Neón

- Primario Neón (Azul Tron): #00E5FF
- Secundario Neón (Cian eléctrico): #00BFFF
- Acento Neón (Violeta digital): #7C3AED

### Texto

- Texto principal: #E0F7FF
- Texto secundario: #94A3B8
- Texto desactivado: #475569

### Mensajes

- Usuario:
  - Fondo: #00E5FF
  - Texto: #001018

- IA:
  - Fondo: #1E293B
  - Texto: #E0F7FF
  - Borde: 1px sólido #00E5FF

### Estados

- Error: #FF3B3B
- Éxito: #00FF9C
- Advertencia: #FACC15

---

## 4. Efectos Visuales Clave

### Glow Effect

Elementos interactivos deben tener glow sutil:

- box-shadow: 0 0 8px #00E5FF
- En hover: intensificar a 0 0 14px #00E5FF

### Bordes Luminosos

- border: 1px solid #00E5FF
- border-radius: 12px – 16px

### Líneas Separadoras

- Líneas finas con color neón al 30% de opacidad

---

## 5. Tipografía

### Fuente Principal

- 'Orbitron', sans-serif (preferida para estética Tron)
- Alternativa: 'Inter' o 'Roboto'

### Jerarquía

- H1: 26px – Bold – Letter spacing ligero
- H2: 20px – Semi-bold
- Texto base: 16px
- Metadatos: 14px

### Estilo

- Ligero tracking (letter-spacing: 0.5px)
- Evitar tipografías serif

---

## 6. Componentes UI

### 6.1 Header

- Fondo oscuro
- Línea inferior neón
- Título “ZenAI” con leve glow
- Indicador de estado tipo punto verde luminoso

---

### 6.2 Área de Chat

- Fondo: #0F172A
- Scroll vertical
- Padding: 16px
- Efecto leve de iluminación en bordes

---

### 6.3 Burbujas de Mensaje

#### Usuario

- Alineado derecha
- Fondo neón azul
- Texto oscuro
- Border-radius: 18px
- Sombra glow azul
- Max-width: 75%

#### IA

- Alineado izquierda
- Fondo oscuro
- Borde neón
- Texto claro
- Glow muy sutil
- Max-width: 75%

---

### 6.4 Input de Mensaje

- Fondo oscuro profundo
- Borde neón
- Border-radius: 24px
- Texto claro
- Placeholder gris azulado

Botón enviar:

- Fondo neón
- Texto oscuro
- Forma redondeada
- Glow fuerte en hover

---

### 6.5 Indicador "Typing"

- Tres puntos animados
- Color neón
- Animación suave
- Efecto pulso

---

## 7. Sistema de Espaciado

Sistema 8px:

- 8px
- 16px
- 24px
- 32px

Mensajes separados por 12px
Padding interno mínimo 16px

---

## 8. Responsive

Mobile:

- Chat ocupa 100%
- Sidebar oculta
- Input fijo abajo

Desktop:

- Sidebar visible
- Chat centrado
- Máximo ancho: 1000px

---

## 9. Animaciones

- Transiciones 0.2s – 0.3s ease
- Glow progresivo
- Aparición fade-in de mensajes
- Evitar animaciones agresivas

---

## 10. Identidad de Marca

ZenAI representa:

- Energía digital
- Conversación inteligente
- Tecnología avanzada
- Minimalismo futurista

El diseño debe sentirse como una consola digital avanzada del futuro.
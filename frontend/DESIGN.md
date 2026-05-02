# EstuArriendo Design System

Este documento define la fuente de verdad para el sistema de diseño visual de **EstuArriendo**. Debe ser consultado y seguido estrictamente por desarrolladores e IA asistentes para mantener una experiencia de usuario (UX/UI) profesional, consistente y coherente en toda la plataforma.

## 1. Concepto Visual
**"Editorial Universitario Latinoamericano"**
La estética debe sentirse moderna, fresca, enérgica pero a la vez muy confiable y profesional. Se aleja de las plantillas genéricas tipo "SaaS" o "Corporate", adoptando un enfoque más audaz, con altos contrastes y un uso intencional del espacio en blanco.

## 2. Paleta de Colores

Nuestra paleta se define en `tailwind.config.js` y debe usarse preferentemente sobre colores genéricos de Tailwind.

### Colores de Marca Principales
- **Brand Blue (`brand-blue`)**: `#1B3A6B` - Color principal para botones primarios, enlaces importantes y acentos sólidos. Transmite confianza y profesionalidad.
- **Brand Dark (`brand-dark`)**: `#0F1F3D` - Azul casi negro. Usado para backgrounds profundos (como el Footer o el overlay del Hero) y texto de alto contraste.
- **Brand Lime (`brand-lime`)**: `#C8F135` - Color de acento de alta energía. Usado para "Trust Badges", etiquetas de destacado ("Popular", "Nuevo"), botones secundarios llamativos o elementos decorativos sobre fondos oscuros.

### Neutros Clave
- **Superficies**: `bg-white`, `bg-gray-50`.
- **Textos**: `text-gray-900` (Títulos), `text-gray-600` o `text-gray-500` (Cuerpo/Párrafos), `text-gray-400` (Metadatos).
- **Bordes**: `border-gray-200` o `border-gray-300`.

## 3. Tipografía

El proyecto utiliza dos fuentes de Google Fonts (configuradas en `layout.tsx` y Tailwind):

- **Títulos y Botones (Plus Jakarta Sans)**: Utilizada mediante la clase `font-jakarta`. Debe aplicarse a:
  - Elementos `<h1>`, `<h2>`, `<h3>`
  - Navegación principal
  - Botones principales
  - Textos de alto impacto o llamadas a la acción
  - Pesos recomendados: `font-bold`, `font-extrabold`.

- **Cuerpo (Lato)**: Utilizada mediante la clase `font-lato`. Es la fuente por defecto del body. Debe aplicarse a:
  - Párrafos `<p>`
  - Descripciones largas
  - Formularios e inputs
  - Textos legales
  - Pesos recomendados: `font-normal`, `font-medium`.

## 4. Estilos de Componentes

### Botones (Buttons & CTAs)
- **Primarios**: Fondo sólido `brand-blue`, texto blanco. *Ejemplo:* `bg-brand-blue text-white hover:bg-brand-blue/90`.
- **Secundarios/Acentos**: Fondo o elementos en `brand-lime`, texto en `brand-dark`. *Ejemplo:* `bg-brand-lime text-brand-dark hover:bg-brand-lime/90`.
- **Ghost/Text**: Texto en `brand-blue` con hover sutil. *Ejemplo:* `text-brand-blue hover:bg-brand-blue/10`.
- **Bordes (Border Radius)**: Los botones principales suelen llevar `rounded-lg` o `rounded-xl`. No usar bordes completamente redondeados (pill) a menos que sea un badge.

### Tarjetas (Cards)
- Fondo blanco (`bg-white`).
- Sombra sutil (`shadow-md` o `shadow-sm`).
- Bordes suaves (`border border-gray-200`).
- Radio de borde (`rounded-xl` o `rounded-2xl`).

## 5. Modo Claro / Oscuro (Dark Mode)

La aplicación soporta Modo Oscuro mediante la estrategia de clases de Tailwind (`darkMode: 'class'`).

### Principios del Modo Oscuro
- **Enfoque Adaptativo**: El "Modo Claro" es la experiencia por defecto, con fondos blancos/grises y textos oscuros. El "Modo Oscuro" invierte las áreas de contenido a fondos casi negros (`gray-900` / `gray-950`) y textos claros (`gray-100` / `gray-300`).
- **Elementos Fijos**: Elementos que ya son oscuros por diseño (como el Hero con su overlay `brand-dark` o el Footer `brand-dark`) mantienen su paleta independientemente del modo.
- **Implementación**: Usar los prefijos `dark:` de Tailwind en componentes.
  - *Ejemplo fondo:* `bg-white dark:bg-gray-900`
  - *Ejemplo texto:* `text-gray-900 dark:text-gray-100`
  - *Ejemplo borde:* `border-gray-200 dark:border-gray-800`

## 6. Reglas de Accesibilidad y Responsive
- Todos los elementos interactivos deben tener un área táctil mínima (Touch Target) en móviles.
- Los contrastes de color deben permitir legibilidad fácil (mantener cuidado con el `brand-lime` sobre fondos blancos, es mejor usarlo sobre fondos oscuros o con bordes si está en fondos claros).
- Todo diseño debe ser validado desde `xs` (mobile) hasta `xl` (desktop ancho).

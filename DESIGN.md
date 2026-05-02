# EstuArriendo - Sistema de Diseño (Design System)

Este documento define la estética, la paleta de colores, la tipografía y los patrones de componentes para la plataforma EstuArriendo. Sirve como fuente de verdad para mantener la coherencia visual en toda la aplicación.

## 1. Identidad de Marca y Filosofía

EstuArriendo utiliza un diseño **moderno, limpio y minimalista (Flat Design)**.
Evitamos los gradientes pesados, sombras excesivas y elementos recargados. La interfaz debe sentirse rápida, profesional y altamente confiable.

El tema **por defecto es el Modo Claro (Light Mode)**, con un Modo Oscuro (Dark Mode) global altamente contrastante.

## 2. Paleta de Colores

Los colores están configurados en `tailwind.config.js` y anulados globalmente en `globals.css` para el modo oscuro.

### Colores Principales (Brand)
- **Brand Dark (`#0F1F3D`)**: Azul marino muy profundo. Se usa como color principal de texto en encabezados en modo claro, y como color de fondo principal en modo oscuro.
- **Brand Blue (`#1B3A6B`)**: Azul marino clásico. Se usa para botones secundarios, acentos, y elementos estructurales.
- **Brand Lime (`#C8F135`)**: Verde lima vibrante. Es el color de **acento principal**. Se utiliza para llamadas a la acción (CTAs) primarias, botones destacados y detalles visuales que requieren la atención del usuario.

### Colores de Fondo (Backgrounds)
- **Modo Claro**: Blanco (`bg-white`), grises muy suaves (`bg-gray-50`, `bg-gray-100`).
- **Modo Oscuro**: Reemplazado por tonos de Brand Dark mediante `.dark` global. (Ej. `.dark .bg-white` se mapea a `#0F1F3D`).

### Texto (Text)
- **Modo Claro**: Gris muy oscuro (`text-gray-900`) para legibilidad principal, `text-gray-500/600` para secundarios.
- **Modo Oscuro**: Blanco (`text-white`) o gris claro (`text-slate-300`).

## 3. Tipografía

- **Fuente Principal**: `Plus Jakarta Sans` (a través de `font-jakarta`).
- **Títulos (Headings)**: Bold (`font-bold` o `font-extrabold`) con tracking ajustado (`tracking-tight`).
- **Cuerpo (Body)**: Regular o Medium para legibilidad.

## 4. Componentes y UI

### Botones (Buttons)
1. **Botón Primario**: 
   - Estilo: `bg-brand-lime text-brand-dark font-bold`
   - Hover: `hover:brightness-95 hover:scale-[1.02]`
   - Transiciones suaves: `transition-all duration-300`
2. **Botón Secundario**: 
   - Estilo: `bg-brand-blue text-white font-medium`
   - O contorneado: `border border-gray-200 bg-white text-gray-700`
3. **Esquinas**: Ligeramente redondeadas (`rounded-lg` o `rounded-xl`).

### Modales (Modals / Dialogs)
- **Backdrop (Fondo oscuro)**: `bg-black/60 backdrop-blur-sm`
- **Contenedor del Modal**: `bg-white dark:bg-brand-dark rounded-2xl shadow-xl border border-gray-100 dark:border-white/10`
- **Encabezado (Header)**: Limpio, sin gradientes. Ocasionalmente un texto en negrita y un sutil borde inferior o línea de acento.
- **Botón de Cerrar**: Ícono (X) pequeño, redondeado: `text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full`.

### Entradas de Texto (Inputs / Forms)
- **Bordes**: `border-gray-300 dark:border-white/20`.
- **Fondo**: `bg-white dark:bg-white/5`.
- **Focus**: Anillos de color de marca (`focus:ring-brand-lime` o `focus:ring-brand-blue`). No usar anillos azules por defecto si chocan con la identidad de marca en ciertas zonas.

## 5. Accesibilidad en Modo Oscuro

Debido a que el color de fondo primario en modo oscuro es muy oscuro (`#0F1F3D`), los colores azules oscuros como `text-brand-blue` no se leen bien.
- El archivo `globals.css` mapea automáticamente `.dark .text-brand-blue` a un celeste brillante (`#38bdf8`) para garantizar el contraste y la accesibilidad de los íconos, enlaces activos y texto secundario.
- Los logotipos deben utilizar su variante `logo-dark.svg` (blanco con lima) mediante las clases `hidden dark:block`.

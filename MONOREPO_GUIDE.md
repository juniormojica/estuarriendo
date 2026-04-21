# Guía de Gestión de Monorepo - EstuArriendo

## 📁 Estructura del Proyecto

```
estuarriendo/
├── frontend/          # Aplicación Next.js (App Router)
├── backend/           # API Express.js
├── .git/              # Control de versiones compartido
├── .gitignore         # Ignorar archivos para ambos proyectos
└── MONOREPO_GUIDE.md  # Esta guía
```

## 🔧 Mejores Prácticas

### 1. **Commits Organizados por Contexto**

Usa **prefijos** en tus commits para identificar qué parte del proyecto modificaste:

```bash
# Para cambios solo en el frontend
git commit -m "frontend: agregar validación de formulario de login"

# Para cambios solo en el backend
git commit -m "backend: migrar a ES modules"

# Para cambios que afectan ambos
git commit -m "fullstack: implementar autenticación JWT"

# Para configuración general
git commit -m "config: actualizar .gitignore para monorepo"

# Para documentación
git commit -m "docs: actualizar README con instrucciones de monorepo"
```

### 2. **Estrategia de Branches**

#### Opción A: Branches por Feature (Recomendado)
```bash
# Branch principal
main

# Branches de desarrollo
develop

# Branches de features (pueden afectar frontend, backend o ambos)
feature/user-authentication
feature/property-search
feature/payment-integration

# Branches de fixes
fix/login-validation
fix/api-cors-error
```

#### Opción B: Branches Separados (Si trabajas en equipos separados)
```bash
main
├── frontend-develop
│   ├── frontend/feature-ui-redesign
│   └── frontend/fix-responsive-layout
└── backend-develop
    ├── backend/feature-new-api
    └── backend/fix-database-connection
```

### 3. **Comandos Git Útiles**

#### Ver cambios solo en una carpeta:
```bash
# Ver cambios solo del frontend
git status frontend/

# Ver cambios solo del backend
git status backend/

# Ver log de commits del frontend
git log -- frontend/

# Ver log de commits del backend
git log -- backend/
```

#### Hacer commits selectivos:
```bash
# Agregar solo archivos del frontend
git add frontend/

# Agregar solo archivos del backend
git add backend/

# Agregar archivos específicos
git add frontend/src/components/Login.tsx
git add backend/src/controllers/authController.js
```

### 4. **Scripts NPM Centralizados (Opcional)**

Puedes crear un `package.json` en la raíz para manejar ambos proyectos:

```json
{
  "name": "estuarriendo-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

### 5. **.gitignore Mejorado**

Tu `.gitignore` actual está bien, pero asegúrate de que cubra ambos proyectos:

```gitignore
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Build outputs
dist/
dist-ssr/
frontend/dist/
backend/dist/
build/

# Environment variables
.env
.env.local
.env.development
.env.production
frontend/.env*
backend/.env*

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Editor
.vscode/*
!.vscode/extensions.json
.idea/
*.swp
*.swo
.DS_Store

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
*.temp
.cache/
```

## 🚀 Flujo de Trabajo Recomendado

### Desarrollo Diario:

```bash
# 1. Actualizar tu rama local
git pull origin main

# 2. Crear una nueva branch para tu feature
git checkout -b feature/nombre-descriptivo

# 3. Trabajar en frontend o backend según necesites
cd frontend  # o cd backend

# 4. Hacer commits frecuentes con prefijos
git add .
git commit -m "frontend: implementar componente de búsqueda"

# 5. Cuando termines la feature
git checkout main
git merge feature/nombre-descriptivo
git push origin main
```

### Trabajar en Frontend y Backend Simultáneamente:

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Git operations
git status
git add frontend/src/...
git add backend/src/...
git commit -m "fullstack: integrar API de propiedades con UI"
```

## 📊 Ventajas del Monorepo

✅ **Un solo repositorio Git** - Historial unificado
✅ **Commits atómicos** - Cambios frontend + backend en un solo commit
✅ **Versionado sincronizado** - Frontend y backend siempre compatibles
✅ **Más fácil de clonar** - Un solo `git clone`
✅ **Refactoring más simple** - Cambios que afectan ambos lados

## ⚠️ Consideraciones

- **Tamaño del repo**: Puede crecer más rápido
- **CI/CD**: Necesitas configurar pipelines que detecten qué cambió
- **Permisos**: Todo el equipo tiene acceso a todo el código
- **Build times**: Puede ser más lento si no optimizas

## 🔍 Herramientas Avanzadas (Opcional)

Para proyectos más grandes, considera:

- **Turborepo**: Optimiza builds y caching
- **Nx**: Monorepo tooling completo
- **Lerna**: Gestión de paquetes múltiples
- **pnpm workspaces**: Gestión eficiente de dependencias

## 📝 Ejemplo de Workflow Completo

```bash
# Día 1: Trabajar en autenticación
git checkout -b feature/authentication

# Modificar backend
cd backend
# ... hacer cambios en authController.js
git add backend/src/controllers/authController.js
git commit -m "backend: agregar endpoint de login"

# Modificar frontend
cd ../frontend
# ... hacer cambios en Login.tsx
git add frontend/src/components/Login.tsx
git commit -m "frontend: conectar formulario de login con API"

# Commit final que une todo
git add .
git commit -m "fullstack: implementar sistema de autenticación completo"

# Merge a main
git checkout main
git merge feature/authentication
git push origin main
```

## 🎯 Recomendación Final

Para tu proyecto **EstuArriendo**, te recomiendo:

1. ✅ Usar **prefijos en commits** (frontend:, backend:, fullstack:)
2. ✅ Mantener **branches por feature** (no separar frontend/backend)
3. ✅ Usar **un solo .gitignore** en la raíz
4. ✅ Hacer **commits atómicos** cuando cambies ambos lados
5. ✅ Documentar cambios importantes en commits descriptivos

Esto te dará flexibilidad sin complicar demasiado el flujo de trabajo.

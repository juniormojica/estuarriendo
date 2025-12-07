# Sistema de Seeds de Base de Datos

## ¿Por qué Seeds en JavaScript en lugar de SQL?

El proyecto ahora utiliza **seeds automáticos en JavaScript** en lugar de archivos SQL manuales por las siguientes razones:

### ✅ Ventajas del Sistema Actual

1. **Automatización Total**
   - Los ENUMs se crean automáticamente al iniciar el servidor
   - No necesitas ejecutar scripts SQL manualmente
   - Perfecto para desarrollo en equipo

2. **Idempotencia**
   - El seed verifica si los ENUMs ya existen antes de crearlos
   - Puedes ejecutarlo múltiples veces sin errores
   - Seguro para usar en desarrollo y producción

3. **Consistencia**
   - Se ejecuta en el mismo entorno que tu aplicación (Node.js)
   - Usa la misma conexión de base de datos
   - Menos posibilidad de errores de configuración

4. **Versionamiento**
   - Los seeds son código JavaScript versionado en Git
   - Todos los desarrolladores tienen la misma configuración
   - Fácil de revisar cambios en pull requests

5. **Facilidad de Uso**
   - No necesitas recordar ejecutar archivos SQL
   - Funciona automáticamente en cada `npm run dev`
   - Scripts npm disponibles para operaciones manuales

## 🚀 Uso

### Automático (Recomendado)

Los ENUMs se crean automáticamente cada vez que inicias el servidor:

```bash
npm run dev
```

El servidor ejecutará:
1. ✅ Conexión a la base de datos
2. 🌱 Seed de ENUMs (si no existen)
3. 🔄 Sincronización de modelos
4. 🚀 Inicio del servidor

### Manual (Opcional)

Si necesitas ejecutar los seeds manualmente:

```bash
# Crear todos los ENUMs
npm run seed

# Eliminar todos los ENUMs (⚠️ cuidado en producción)
npm run seed:drop

# Resetear: eliminar y recrear todos los ENUMs
npm run seed:reset
```

## 📁 Estructura de Archivos

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuración de Sequelize
│   │   └── seedEnums.js     # ✨ Seed de ENUMs (NUEVO)
│   └── server.js            # Ejecuta seeds automáticamente
├── scripts/
│   └── seed.js              # ✨ CLI para seeds manuales (NUEVO)
└── database/
    └── init-enums.sql       # ⚠️ DEPRECADO - Ya no es necesario
```

## 🔧 Cómo Funciona

### 1. Definición de ENUMs (`src/config/seedEnums.js`)

```javascript
const enumDefinitions = [
    {
        name: 'enum_users_id_type',
        values: ['CC', 'NIT', 'CE', 'Pasaporte'],
        comment: 'Types of identification documents'
    },
    // ... más ENUMs
];
```

### 2. Verificación de Existencia

Antes de crear cada ENUM, el seed verifica si ya existe:

```javascript
const [results] = await sequelize.query(`
    SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = '${enumDef.name}'
    );
`);
```

### 3. Creación Condicional

Solo crea el ENUM si no existe:

```javascript
if (!exists) {
    await sequelize.query(`CREATE TYPE ${enumDef.name} AS ENUM (...);`);
    console.log(`✅ Created ENUM: ${enumDef.name}`);
} else {
    console.log(`⏭️  ENUM already exists: ${enumDef.name}`);
}
```

## 🆕 Para Nuevos Desarrolladores

Si eres nuevo en el proyecto, simplemente:

1. Clona el repositorio
2. Configura tu `.env` con las credenciales de PostgreSQL
3. Ejecuta `npm install`
4. Ejecuta `npm run dev`

¡Eso es todo! Los ENUMs se crearán automáticamente.

## 🔄 Migrando desde el Sistema Antiguo

Si anteriormente ejecutaste `init-enums.sql`:

1. **No necesitas hacer nada** - El nuevo sistema detectará que los ENUMs ya existen
2. El archivo `database/init-enums.sql` ahora es **obsoleto** y puede eliminarse
3. Los seeds automáticos tomarán el control desde ahora

## 📝 Agregar Nuevos ENUMs

Para agregar un nuevo ENUM al sistema:

1. Abre `src/config/seedEnums.js`
2. Agrega tu definición al array `enumDefinitions`:

```javascript
{
    name: 'enum_nuevo_campo',
    values: ['valor1', 'valor2', 'valor3'],
    comment: 'Descripción del ENUM'
}
```

3. Si necesitas eliminarlo también, agrégalo a `dropAllEnums()`
4. Reinicia el servidor o ejecuta `npm run seed`

## ⚠️ Advertencias

- **`npm run seed:drop`** eliminará todos los ENUMs con CASCADE
- **`npm run seed:reset`** eliminará y recreará todos los ENUMs
- Usa estos comandos con cuidado en producción
- En producción, considera usar migraciones en lugar de seeds automáticos

## 🎯 Beneficios para el Equipo

- ✅ Onboarding más rápido para nuevos desarrolladores
- ✅ Menos errores de configuración
- ✅ Configuración consistente entre entornos
- ✅ Menos pasos manuales en el setup
- ✅ Mejor experiencia de desarrollo

---

**Nota**: El archivo `database/init-enums.sql` se mantiene por compatibilidad pero ya no es necesario ejecutarlo manualmente.

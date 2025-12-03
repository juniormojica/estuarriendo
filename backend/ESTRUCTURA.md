# EstuArriendo Backend - Estructura del Proyecto

## 📁 Estructura de Carpetas

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de Sequelize y PostgreSQL
│   │
│   ├── models/
│   │   ├── index.js             # Centraliza modelos y asociaciones
│   │   └── User.js              # Modelo de ejemplo (Usuario)
│   │
│   ├── controllers/
│   │   └── userController.js    # Controlador CRUD de usuarios
│   │
│   ├── routes/
│   │   └── userRoutes.js        # Rutas API de usuarios
│   │
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticación (placeholder)
│   │
│   ├── utils/
│   │   └── responseHelper.js    # Utilidades para respuestas y conversión de casos
│   │
│   └── server.js                # Punto de entrada del servidor
│
├── .env                         # Variables de entorno (no en git)
├── .env.example                 # Plantilla de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Configuración Realizada

### 1. **Sequelize con Nomenclatura snake_case → camelCase**
- Base de datos usa `snake_case` (ej: `first_name`, `created_at`)
- API retorna `camelCase` (ej: `firstName`, `createdAt`)
- Configurado en `src/config/database.js`

### 2. **Modelo de Ejemplo: User**
```javascript
// En DB: first_name, last_name, created_at
// En API: firstName, lastName, createdAt
```

### 3. **Endpoints Disponibles**
- `GET /api/health` - Health check
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

## 🚀 Próximos Pasos

1. **Crear base de datos PostgreSQL**:
   ```sql
   CREATE DATABASE estuarriendo_db;
   ```

2. **Configurar .env**:
   - Copiar `.env.example` a `.env`
   - Actualizar credenciales de PostgreSQL

3. **Iniciar servidor**:
   ```bash
   npm run dev
   ```

4. **Probar endpoints**:
   ```bash
   # Health check
   curl http://localhost:3001/api/health
   
   # Crear usuario
   curl -X POST http://localhost:3001/api/users \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"123456","firstName":"Juan","lastName":"Pérez","role":"student"}'
   ```

## 📝 Notas Importantes

- **Convención de nombres**: Todos los modelos futuros deben seguir el patrón snake_case en DB
- **Middleware**: El archivo `auth.js` es un placeholder para futura implementación de JWT
- **Utilidades**: `responseHelper.js` incluye funciones para convertir entre snake_case y camelCase
- **Sincronización**: El servidor sincroniza automáticamente los modelos con la DB en modo desarrollo

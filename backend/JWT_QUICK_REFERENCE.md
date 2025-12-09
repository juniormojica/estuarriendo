# JWT Authentication - Quick Reference

## 🔐 Credenciales de Prueba

Todos los usuarios de prueba tienen la contraseña: **`password123`**

### Super Admin
- Email: `superadmin@estuarriendo.com`
- Password: `password123`

### Propietarios
- `owner1@example.com` hasta `owner10@example.com`
- Password: `password123`

### Estudiantes
- `student1@example.com` hasta `student15@example.com`
- Password: `password123`

---

## 📡 Endpoints de Autenticación

### Registro
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nombre Completo",
  "email": "usuario@example.com",
  "password": "contraseña",
  "phone": "+57 300 123 4567",
  "userType": "tenant" // o "owner"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña"
}
```

**Respuesta:**
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Obtener Usuario Actual
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 🔧 Variables de Entorno Requeridas

En tu archivo `.env`:

```env
JWT_SECRET=tu-clave-secreta-aqui
JWT_EXPIRATION=7d
```

---

## 🛡️ Proteger Rutas

Para proteger cualquier ruta, agrega el middleware de autenticación:

```javascript
import authMiddleware from '../middleware/auth.js';

// Ruta protegida
router.post('/properties', authMiddleware, propertyController.create);

// El ID del usuario estará disponible en req.userId
```

---

## 📋 Rutas Públicas vs Protegidas

### Públicas (sin autenticación)
- ✅ `GET /api/properties` - Listar propiedades
- ✅ `GET /api/properties/:id` - Ver detalle de propiedad
- ✅ `GET /api/amenities` - Listar amenidades
- ✅ `POST /api/auth/register` - Registro
- ✅ `POST /api/auth/login` - Login

### Protegidas (requieren JWT)
- 🔒 `POST /api/properties` - Crear propiedad
- 🔒 `PUT /api/properties/:id` - Actualizar propiedad
- 🔒 `DELETE /api/properties/:id` - Eliminar propiedad
- 🔒 `GET /api/auth/me` - Usuario actual
- 🔒 `GET /api/notifications` - Notificaciones
- 🔒 Todas las rutas de `/api/users`

---

## 🔄 Migración de Base de Datos

Si ya tienes datos en la base de datos, ejecuta:

```bash
node scripts/addPasswordColumn.js
```

Esto agregará la columna `password` y establecerá `password123` como contraseña predeterminada para todos los usuarios existentes.

---

## 🧪 Probar la Autenticación

### Con PowerShell:

**Registro:**
```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/auth/register `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"Test","email":"test@example.com","password":"test123","phone":"+57 300 123 4567","userType":"tenant"}'
```

**Login:**
```powershell
$response = Invoke-WebRequest -Uri http://localhost:3001/api/auth/login `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@example.com","password":"test123"}'

$token = ($response.Content | ConvertFrom-Json).token
```

**Usar Token:**
```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/auth/me `
  -Headers @{"Authorization"="Bearer $token"}
```

---

## 📦 Archivos Creados

### Utilidades
- `src/utils/jwtUtils.js` - Generación y verificación de tokens
- `src/utils/passwordUtils.js` - Hash y comparación de contraseñas

### Autenticación
- `src/services/authService.js` - Lógica de negocio
- `src/controllers/authController.js` - Controladores HTTP
- `src/routes/authRoutes.js` - Definición de rutas

### Middleware
- `src/middleware/auth.js` - Middleware de autenticación JWT

### Scripts
- `scripts/addPasswordColumn.js` - Migración de base de datos

---

## ⚠️ Importante

1. **Nunca** compartas tu `JWT_SECRET` en producción
2. Las contraseñas **nunca** se devuelven en las respuestas de la API
3. Los tokens expiran según `JWT_EXPIRATION` (por defecto: 7 días)
4. Todos los usuarios de prueba tienen la contraseña `password123`

---

## 🚀 Próximos Pasos

1. Integrar con el frontend
2. Proteger las rutas que lo necesiten
3. Implementar refresh tokens (opcional)
4. Agregar recuperación de contraseña (opcional)
5. Agregar verificación de email (opcional)

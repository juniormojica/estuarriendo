# Password Reset - Guía Rápida

## 🔐 Flujo Completo de Recuperación de Contraseña

### Paso 1: Solicitar Reset de Contraseña

```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

**Respuesta:**
```json
{
  "message": "Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña",
  "token": "1f9c49434d41aaac2f3d2960e01e043fcb0219fa...",
  "email": "usuario@example.com"
}
```

> [!NOTE]
> En producción, el `token` y `email` NO deben incluirse en la respuesta. El token debe enviarse por correo electrónico.

---

### Paso 2: Verificar Token (Opcional)

```bash
GET /api/auth/reset-password/:token
```

**Respuesta:**
```json
{
  "valid": true,
  "email": "us***@example.com",
  "userId": "3dbf1df4-e0b1-4078-a47b-f3feee7354e1"
}
```

El email se muestra enmascarado por seguridad.

---

### Paso 3: Resetear Contraseña

```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "1f9c49434d41aaac2f3d2960e01e043fcb0219fa...",
  "newPassword": "nuevaContraseña123"
}
```

**Respuesta:**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

---

## 🔒 Características de Seguridad

✅ **Token Hasheado**: El token se guarda hasheado en la base de datos (SHA-256)  
✅ **Expiración**: Los tokens expiran en 1 hora  
✅ **Un Solo Uso**: El token se invalida después de usarse  
✅ **Email Enmascarado**: No se revela el email completo al verificar  
✅ **No Enumeration**: No revela si el email existe en el sistema  
✅ **Validación de Contraseña**: Mínimo 6 caracteres

---

## 📋 Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/forgot-password` | Solicitar reset de contraseña |
| GET | `/api/auth/reset-password/:token` | Verificar validez del token |
| POST | `/api/auth/reset-password` | Resetear contraseña con token |

---

## 🧪 Pruebas con PowerShell

### Flujo Completo

```powershell
# Paso 1: Solicitar reset
$body1 = @{email='testuser@example.com'} | ConvertTo-Json
$response1 = Invoke-WebRequest -Uri http://localhost:3001/api/auth/forgot-password `
  -Method POST -Headers @{"Content-Type"="application/json"} -Body $body1
$token = ($response1.Content | ConvertFrom-Json).token

# Paso 2: Verificar token
$response2 = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/reset-password/$token"
$response2.Content | ConvertFrom-Json

# Paso 3: Resetear contraseña
$body3 = @{token=$token; newPassword='nuevaPassword123'} | ConvertTo-Json
$response3 = Invoke-WebRequest -Uri http://localhost:3001/api/auth/reset-password `
  -Method POST -Headers @{"Content-Type"="application/json"} -Body $body3
$response3.Content | ConvertFrom-Json

# Paso 4: Login con nueva contraseña
$body4 = @{email='testuser@example.com'; password='nuevaPassword123'} | ConvertTo-Json
$response4 = Invoke-WebRequest -Uri http://localhost:3001/api/auth/login `
  -Method POST -Headers @{"Content-Type"="application/json"} -Body $body4
$response4.Content | ConvertFrom-Json
```

---

## 🗄️ Cambios en la Base de Datos

Se agregaron 2 columnas a la tabla `users`:

```sql
reset_password_token VARCHAR(255)    -- Token hasheado
reset_password_expires TIMESTAMP     -- Fecha de expiración
```

Para sincronizar la base de datos:

```bash
node scripts/syncUserModel.js
```

---

## ⚠️ Errores Comunes

### Token Inválido o Expirado
```json
{
  "error": "Token inválido o expirado"
}
```
**Solución**: Solicitar un nuevo token

### Token Expirado
```json
{
  "error": "El token ha expirado. Por favor solicita uno nuevo"
}
```
**Solución**: Los tokens expiran en 1 hora. Solicitar uno nuevo.

### Contraseña Muy Corta
```json
{
  "error": "La contraseña debe tener al menos 6 caracteres"
}
```
**Solución**: Usar una contraseña de al menos 6 caracteres

---

## 📦 Archivos Creados

### Utilidades
- `src/utils/tokenUtils.js` - Generación y validación de tokens

### Modelos
- `src/models/User.js` - Campos `resetPasswordToken` y `resetPasswordExpires`

### Servicios
- `src/services/authService.js` - Funciones `requestPasswordReset`, `verifyResetToken`, `resetPassword`

### Controladores
- `src/controllers/authController.js` - Controladores `forgotPassword`, `verifyResetToken`, `resetPassword`

### Rutas
- `src/routes/authRoutes.js` - Rutas de password reset

### Scripts
- `scripts/syncUserModel.js` - Sincronización de base de datos

---

## 🚀 Integración con Email (Producción)

Para producción, debes:

1. **Instalar un servicio de email** (ej: Nodemailer, SendGrid, AWS SES)
2. **Modificar `authService.js`**:
   ```javascript
   // En requestPasswordReset(), en lugar de retornar el token:
   await sendEmail({
     to: user.email,
     subject: 'Recuperación de Contraseña',
     html: `
       <p>Haz clic en el siguiente enlace para resetear tu contraseña:</p>
       <a href="https://tuapp.com/reset-password?token=${rawToken}">
         Resetear Contraseña
       </a>
       <p>Este enlace expira en 1 hora.</p>
     `
   });
   
   return {
     message: 'Si el email existe, recibirás instrucciones'
     // NO retornar token ni email
   };
   ```

3. **Crear página en el frontend** para capturar el token de la URL y mostrar formulario

---

## 🔄 Próximos Pasos

1. Integrar con servicio de email
2. Crear UI en el frontend
3. Agregar rate limiting para prevenir spam
4. Implementar logs de seguridad
5. Agregar notificación al usuario cuando se cambia la contraseña

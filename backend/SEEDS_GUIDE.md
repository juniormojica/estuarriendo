# 🌱 Sistema de Seeds de Base de Datos

Este documento explica cómo usar el sistema de seeds para poblar la base de datos con datos de prueba.

## 📋 Tipos de Seeds

### 1. Seeds de ENUMs (`seedEnums.js`)
Crea los tipos ENUM en PostgreSQL (se ejecuta automáticamente al iniciar el servidor).

### 2. Seeds de Datos (`seedData.js`)
Crea datos de prueba realistas usando Faker.js.

---

## 🚀 Uso Rápido

### Poblar la Base de Datos

```bash
# Crear todos los datos de prueba
npm run seed:data
```

Esto creará:
- **1 Super Admin** - `superadmin@estuarriendo.com`
- **2 Admins** - `admin1@estuarriendo.com`, `admin2@estuarriendo.com`
- **10 Owners** (propietarios)
  - 5 individuales, 5 agencias
  - 3 con plan premium
  - 7 verificados
- **15 Tenants** (estudiantes) - `student1@example.com` ... `student15@example.com`
- **20 Amenidades** (WiFi, Piscina, Gimnasio, etc.)
- **30 Propiedades**
  - 60% aprobadas
  - 30% pendientes
  - 10% rechazadas
- **Payment Requests** para usuarios premium
- **10 Student Requests** (solicitudes de estudiantes)
- **Notificaciones** de interés, aprobaciones y rechazos
- **100 Activity Logs** (registros de actividad)

---

## 📝 Comandos Disponibles

### Seeds de ENUMs

```bash
# Crear ENUMs (normalmente automático)
npm run seed

# Eliminar todos los ENUMs
npm run seed:drop

# Resetear ENUMs (eliminar y recrear)
npm run seed:reset
```

### Seeds de Datos

```bash
# Crear datos de prueba
npm run seed:data

# Limpiar todos los datos
npm run seed:data:clear

# Resetear: limpiar y recrear todos los datos
npm run seed:data:reset
```

---

## 👥 Usuarios de Prueba

### Super Admin
- **Email**: `superadmin@estuarriendo.com`
- **Rol**: Super Administrador
- **Acceso**: Completo

### Admins
- **Email**: `admin1@estuarriendo.com`, `admin2@estuarriendo.com`
- **Rol**: Administrador
- **Acceso**: Gestión de propiedades y usuarios

### Owners (Propietarios)
- **Email**: `owner1@example.com` ... `owner10@example.com`
- **Tipos**:
  - `owner1` - `owner5`: Individuales
  - `owner6` - `owner10`: Agencias
- **Premium**: `owner1`, `owner2`, `owner3`
- **Verificados**: `owner1` - `owner7`

### Tenants (Estudiantes)
- **Email**: `student1@example.com` ... `student15@example.com`
- **Rol**: Estudiante/Inquilino
- **Acceso**: Búsqueda de propiedades

---

## 🏘️ Datos Generados

### Propiedades

Las propiedades se generan con:
- **Tipos**: Pensión, Habitación, Apartamento, Aparta-estudio
- **Ubicaciones**: 10 barrios de Bogotá
- **Precios**: Entre $500,000 y $2,500,000 COP
- **Imágenes**: URLs de placeholder (Picsum)
- **Amenidades**: 3-10 amenidades aleatorias por propiedad
- **Estados**:
  - 60% Aprobadas (visibles en el sitio)
  - 30% Pendientes (esperando revisión)
  - 10% Rechazadas

### Amenidades

20 amenidades comunes:
- WiFi, Aire Acondicionado, Calefacción
- Cocina Equipada, Lavadora, Secadora
- Parqueadero, Gimnasio, Piscina
- Zona BBQ, Seguridad 24/7, Ascensor
- Balcón, Terraza, Amoblado
- Mascotas Permitidas, Zona de Estudio
- Sala de Juegos, Portería, Zona Verde

### Notificaciones

Se generan notificaciones de:
- **Interés en propiedades**: Cuando un estudiante muestra interés
- **Aprobación de propiedades**: Cuando admin aprueba una propiedad
- **Rechazo de propiedades**: Cuando admin rechaza una propiedad
- **Verificación de pagos**: Cuando se verifica un pago premium

---

## 🔧 Personalización

### Modificar Cantidad de Datos

Edita `scripts/seedData.js`:

```javascript
// Cambiar número de usuarios
for (let i = 1; i <= 10; i++) {  // ← Cambia este número
    // ...
}

// Cambiar número de propiedades
for (let i = 1; i <= 30; i++) {  // ← Cambia este número
    // ...
}
```

### Agregar Nuevas Amenidades

En la función `seedAmenities()`:

```javascript
const amenities = [
    { name: 'Nueva Amenidad', icon: 'icon_name' },
    // ...
];
```

### Modificar Barrios

En la función `seedProperties()`:

```javascript
const neighborhoods = [
    'Nuevo Barrio',
    // ...
];
```

---

## ⚠️ Advertencias

### En Desarrollo

✅ **Seguro usar**:
- `npm run seed:data` - Agrega datos
- `npm run seed:data:reset` - Limpia y recrea datos

### En Producción

❌ **NO USAR**:
- `npm run seed:data:clear` - Eliminará TODOS los datos
- `npm run seed:data:reset` - Eliminará y recreará datos
- `npm run seed:drop` - Eliminará los ENUMs

⚠️ **Usar con precaución**:
- `npm run seed:data` - Solo si necesitas datos de prueba

---

## 🔄 Flujo de Trabajo Recomendado

### Setup Inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env
# DB_HOST=localhost
# DB_USER=postgres
# DB_PASSWORD=tu_password
# DB_NAME=estuarriendo_db

# 3. Iniciar servidor (crea ENUMs automáticamente)
npm run dev

# 4. En otra terminal, poblar datos
npm run seed:data
```

### Durante Desarrollo

```bash
# Si necesitas datos frescos
npm run seed:data:reset

# Si solo quieres limpiar
npm run seed:data:clear

# Si solo quieres agregar más datos
npm run seed:data
```

---

## 📊 Verificación

Después de ejecutar los seeds, puedes verificar:

```bash
# Ver resumen en la consola
npm run seed:data
```

Output esperado:
```
✅ Database seeding completed successfully!

📊 Summary:
   - Users: 28
   - Amenities: 20
   - Properties: 30
   - Payment Requests: X
   - Student Requests: 10
   - Notifications: X
   - Activity Logs: 100
```

---

## 🐛 Troubleshooting

### Error: "relation does not exist"

**Causa**: Las tablas no existen en la base de datos.

**Solución**:
```bash
# Iniciar el servidor primero para crear las tablas
npm run dev

# Luego en otra terminal
npm run seed:data
```

### Error: "ENUM type already exists"

**Causa**: Los ENUMs ya fueron creados.

**Solución**: Esto es normal, los seeds son idempotentes.

### Error: "foreign key constraint"

**Causa**: Intentando eliminar datos con relaciones.

**Solución**:
```bash
# Usar reset en lugar de clear
npm run seed:data:reset
```

---

## 📚 Recursos

- **Faker.js Docs**: https://fakerjs.dev/
- **Sequelize Docs**: https://sequelize.org/
- **PostgreSQL ENUM**: https://www.postgresql.org/docs/current/datatype-enum.html

---

## 🎯 Próximos Pasos

Después de poblar la base de datos:

1. ✅ Probar endpoints con Postman/Thunder Client
2. ✅ Verificar relaciones entre modelos
3. ✅ Comenzar integración con frontend
4. ✅ Desarrollar funcionalidades con datos reales

---

**Nota**: Los datos generados son completamente ficticios y solo para propósitos de desarrollo y pruebas.

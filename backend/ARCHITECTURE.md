# Backend Architecture Guide

## Patrón de Arquitectura: Controller → Service → Repository

Este proyecto sigue una arquitectura en capas que separa las responsabilidades en tres niveles principales:

```
Routes → Controllers → Services → Repositories → Models → Database
```

## Estructura de Carpetas

```
backend/src/
├── routes/          # Definición de endpoints HTTP
├── controllers/     # Manejo de peticiones/respuestas HTTP
├── services/        # Lógica de negocio
├── repositories/    # Acceso a datos (queries)
├── models/          # Modelos de Sequelize
├── middleware/      # Middleware de Express
└── utils/           # Utilidades y helpers
```

## Responsabilidades por Capa

### 1. Routes (`src/routes/`)

**Responsabilidad**: Definir los endpoints HTTP y asociarlos con los controllers

```javascript
// userRoutes.js
import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
```

**Debe**:
- Definir rutas y métodos HTTP
- Aplicar middleware específico de ruta
- Asociar rutas con funciones del controller

**NO debe**:
- Contener lógica de negocio
- Acceder directamente a servicios o repositorios

---

### 2. Controllers (`src/controllers/`)

**Responsabilidad**: Manejar peticiones HTTP y delegar al servicio correspondiente

```javascript
// userController.js
import * as userService from '../services/userService.js';

export const createUser = async (req, res) => {
    try {
        const userData = req.body;
        const user = await userService.createUser(userData);
        res.status(201).json(user);
    } catch (error) {
        handleError(res, error);
    }
};
```

**Debe**:
- Extraer parámetros de `req` (body, params, query)
- Llamar al servicio correspondiente
- Devolver respuesta HTTP con código de estado apropiado
- Manejar errores y convertirlos en respuestas HTTP

**NO debe**:
- Contener lógica de negocio
- Hacer queries directas a la base de datos
- Conocer detalles de implementación de servicios

---

### 3. Services (`src/services/`)

**Responsabilidad**: Implementar la lógica de negocio y orquestar operaciones

```javascript
// userService.js
import * as userRepository from '../repositories/userRepository.js';

export const createUser = async (userData) => {
    // Validar reglas de negocio
    validateUserData(userData);
    
    // Verificar duplicados
    const existing = await userRepository.findById(userData.id);
    if (existing) {
        throw new ConflictError('User already exists');
    }
    
    // Preparar datos con defaults
    const preparedData = prepareNewUserData(userData);
    
    // Crear usuario
    const user = await userRepository.create(preparedData);
    
    // Sanitizar respuesta
    return sanitizeUser(user);
};
```

**Debe**:
- Implementar validaciones de reglas de negocio
- Orquestar múltiples operaciones de repositorio
- Manejar transacciones complejas
- Preparar y transformar datos
- Lanzar errores de negocio personalizados

**NO debe**:
- Conocer detalles de HTTP (req/res)
- Hacer queries directas con Sequelize
- Depender de otros servicios (preferir composición)

---

### 4. Repositories (`src/repositories/`)

**Responsabilidad**: Encapsular todo el acceso a la base de datos

```javascript
// userRepository.js
import { User, UserVerificationDocuments } from '../models/index.js';

export const findById = async (id, options = {}) => {
    const defaultOptions = {
        attributes: { exclude: ['password'] },
        include: [
            {
                model: UserVerificationDocuments,
                as: 'verificationDocuments'
            }
        ]
    };
    
    return await User.findByPk(id, { ...defaultOptions, ...options });
};

export const create = async (userData) => {
    return await User.create(userData);
};
```

**Debe**:
- Encapsular todas las operaciones de base de datos
- Definir includes y asociaciones por defecto
- Proporcionar interfaz limpia para acceso a datos
- Manejar queries complejas de Sequelize

**NO debe**:
- Contener lógica de negocio
- Validar reglas de negocio
- Conocer detalles de HTTP

---

## Manejo de Errores

### Errores Personalizados en Services

```javascript
// userService.js
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}
```

### Manejo en Controllers

```javascript
const handleError = (res, error) => {
    console.error('Controller error:', error);
    
    // Errores personalizados del servicio
    if (error.statusCode) {
        return res.status(error.statusCode).json({ 
            error: error.message 
        });
    }
    
    // Errores inesperados
    res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
    });
};
```

## Flujo de una Petición

```
1. Cliente hace petición HTTP
   ↓
2. Express Router recibe la petición
   ↓
3. Middleware de autenticación/validación (si aplica)
   ↓
4. Controller extrae parámetros de req
   ↓
5. Controller llama al Service
   ↓
6. Service valida reglas de negocio
   ↓
7. Service llama a uno o más Repositories
   ↓
8. Repository ejecuta query en la BD
   ↓
9. Repository devuelve datos al Service
   ↓
10. Service transforma/prepara datos
   ↓
11. Service devuelve resultado al Controller
   ↓
12. Controller formatea respuesta HTTP
   ↓
13. Cliente recibe respuesta
```

## Ejemplo Completo: Crear Usuario

### Route
```javascript
// userRoutes.js
router.post('/', userController.createUser);
```

### Controller
```javascript
// userController.js
export const createUser = async (req, res) => {
    try {
        const userData = req.body;
        const user = await userService.createUser(userData);
        res.status(201).json(user);
    } catch (error) {
        handleError(res, error);
    }
};
```

### Service
```javascript
// userService.js
export const createUser = async (userData) => {
    // Validar campos requeridos
    validateUserData(userData);
    
    // Verificar si ya existe
    const existing = await userRepository.findById(userData.id);
    if (existing) {
        throw new ConflictError('User already exists');
    }
    
    // Preparar datos con defaults
    const preparedData = prepareNewUserData(userData);
    
    // Crear usuario
    const user = await userRepository.create(preparedData);
    
    // Sanitizar respuesta (eliminar password)
    return sanitizeUser(user);
};
```

### Repository
```javascript
// userRepository.js
export const create = async (userData) => {
    return await User.create(userData);
};
```

## Beneficios de esta Arquitectura

### 1. Separación de Responsabilidades
Cada capa tiene una única responsabilidad bien definida

### 2. Reutilización de Código
La lógica de negocio puede ser llamada desde:
- Controllers HTTP
- Jobs programados (cron)
- Scripts de migración
- Tests unitarios

### 3. Testabilidad
Cada capa puede testearse de forma aislada:
```javascript
// Test de Service (mock del repository)
jest.mock('../repositories/userRepository');
test('createUser throws error if user exists', async () => {
    userRepository.findById.mockResolvedValue({ id: '123' });
    await expect(userService.createUser({ id: '123' }))
        .rejects.toThrow('User already exists');
});
```

### 4. Mantenibilidad
Cambios en una capa no afectan a las demás:
- Cambiar ORM: solo afecta repositories
- Cambiar lógica de negocio: solo afecta services
- Cambiar formato de respuesta: solo afecta controllers

### 5. Escalabilidad
Fácil agregar nuevas funcionalidades siguiendo el mismo patrón

## Convenciones de Código

### Nombres de Archivos
- Routes: `{entity}Routes.js` (ej: `userRoutes.js`)
- Controllers: `{entity}Controller.js` (ej: `userController.js`)
- Services: `{entity}Service.js` (ej: `userService.js`)
- Repositories: `{entity}Repository.js` (ej: `userRepository.js`)

### Nombres de Funciones

**Controllers y Services**: Verbos descriptivos
```javascript
getAllUsers
getUserById
createUser
updateUser
deleteUser
```

**Repositories**: Operaciones CRUD genéricas
```javascript
findAll
findById
findByEmail
create
update
deleteById
```

### Exports
Usar named exports para facilitar tree-shaking:
```javascript
// ✅ Correcto
export const createUser = async () => { ... };

// ❌ Evitar
export default { createUser };
```

## Cómo Agregar un Nuevo Módulo

### 1. Crear el Repository
```javascript
// src/repositories/productRepository.js
import { Product } from '../models/index.js';

export const findAll = async (options = {}) => {
    return await Product.findAll(options);
};

export const findById = async (id) => {
    return await Product.findByPk(id);
};

export const create = async (productData) => {
    return await Product.create(productData);
};

// ... más operaciones
```

### 2. Crear el Service
```javascript
// src/services/productService.js
import * as productRepository from '../repositories/productRepository.js';

export const getAllProducts = async () => {
    return await productRepository.findAll();
};

export const createProduct = async (productData) => {
    // Validaciones de negocio
    validateProductData(productData);
    
    // Crear producto
    const product = await productRepository.create(productData);
    
    return product;
};

// ... más lógica de negocio
```

### 3. Crear el Controller
```javascript
// src/controllers/productController.js
import * as productService from '../services/productService.js';

export const getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (error) {
        handleError(res, error);
    }
};

export const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        const product = await productService.createProduct(productData);
        res.status(201).json(product);
    } catch (error) {
        handleError(res, error);
    }
};

// ... más handlers
```

### 4. Crear las Routes
```javascript
// src/routes/productRoutes.js
import express from 'express';
import * as productController from '../controllers/productController.js';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);

export default router;
```

### 5. Registrar en server.js
```javascript
// src/server.js
import productRoutes from './routes/productRoutes.js';

app.use('/api/products', productRoutes);
```

## Mejores Prácticas

### 1. Mantener Controllers Delgados
Los controllers solo deben manejar HTTP, toda la lógica va en services

### 2. Services Sin Estado
Los services deben ser stateless, no guardar estado entre llamadas

### 3. Repositories Genéricos
Crear funciones de repository reutilizables con opciones configurables

### 4. Errores Descriptivos
Usar errores personalizados con mensajes claros y códigos HTTP apropiados

### 5. Documentación
Documentar funciones complejas con JSDoc

### 6. Validación en Capas
- Controllers: Validación de formato HTTP
- Services: Validación de reglas de negocio
- Models: Validación de esquema de datos

## Migración de Código Existente

Para migrar un controller existente:

1. **Identificar queries directas** en el controller
2. **Mover queries al repository** como funciones
3. **Mover lógica de negocio al service**
4. **Simplificar controller** para solo manejar HTTP
5. **Probar** que todo funcione igual

## Recursos Adicionales

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

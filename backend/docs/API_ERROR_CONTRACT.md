# Contrato de errores API (backend → frontend)

## TL;DR para frontend

Usá **`code` como clave de lógica de UI** (flujos, toasts, redirecciones, i18n) y tratá **`message` solo como texto de apoyo**.

## Respuesta estándar de error

```json
{
  "error": "Mensaje legible",
  "message": "Mensaje legible",
  "code": "SEMANTIC_CODE",
  "details": {}
}
```

- `error` y `message` hoy se envían con el mismo valor.
- `code` es el contrato estable para consumidor frontend.
- `details` es opcional y **solo** se incluye cuando el backend lanza `AppError` con `details`.

## Cómo interpretar `code` vs `message`

- **`code` (estable):** usar para decisiones de producto (ej: mostrar CTA de recuperar contraseña si `AUTH_INVALID_CREDENTIALS`).
- **`message` (variable):** no usar como condición de negocio; puede cambiar por copy, idioma o seguridad.

## Comportamiento del middleware de errores

### 1) Error esperado (`AppError`)
- Respeta `statusCode`, `message`, `code`.
- Si existe `details`, se propaga en la respuesta.

### 2) Bridge legacy (`Error` con `statusCode/status` 4xx)
- Si llega un `Error` legacy con `statusCode` o `status` entre 400-499, se respeta ese status.
- `code` cae en `error.code` o `OPERATIONAL_ERROR` si no viene definido.
- No agrega `details`.

### 3) Error inesperado
- Responde `500` con payload sanitizado:
  - `message/error`: `Error interno del servidor`
  - `code`: `INTERNAL_SERVER_ERROR`
- El detalle técnico se loguea en backend y no se expone al cliente.

## Códigos semánticos cubiertos en este branch

> Fuente: servicios `auth`, `email`, `googleAuth`, `container`, `property` y sus tests.

| Dominio | Code | HTTP esperado |
|---|---|---|
| auth | `AUTH_EMAIL_ALREADY_EXISTS` | 400 |
| auth | `AUTH_INVALID_CREDENTIALS` | 401 |
| auth | `AUTH_ACCOUNT_DISABLED` | 403 |
| auth | `AUTH_USER_NOT_FOUND` | 404 |
| auth | `AUTH_PASSWORD_RESET_EMAIL_NOT_FOUND` | 404 |
| auth | `AUTH_RESET_TOKEN_INVALID_OR_EXPIRED` | 400 |
| auth | `AUTH_RESET_TOKEN_EXPIRED` | 400 |
| auth | `AUTH_PASSWORD_RESET_USER_NOT_FOUND` | 404 |
| auth | `AUTH_GOOGLE_EMAIL_ALREADY_REGISTERED` | 409 |
| google | `AUTH_GOOGLE_TOKEN_INVALID` | 401 |
| google | `AUTH_GOOGLE_EMAIL_NOT_VERIFIED` | 401 |
| google | `AUTH_GOOGLE_TOKEN_VERIFICATION_FAILED` | 401 |
| email | `EMAIL_PROVIDER_NOT_CONFIGURED` | 500 |
| email | `EMAIL_SEND_FAILED` | 500 |
| container | `CONTAINER_NOT_FOUND` | 404 |
| container | `INVALID_CONTAINER_PARENT` | 400 |
| container | `PROPERTY_NOT_CONTAINER` | 400 |
| container | `UNIT_NOT_FOUND` | 404 |
| container | `PROPERTY_NOT_UNIT` | 400 |
| container | `CONTAINER_UNITS_ALREADY_RENTED` | 409 |
| property | `PROPERTY_TYPE_INVALID_NAME` | 400 |
| property | `PROPERTY_TYPE_REQUIRED` | 400 |
| property | `PROPERTY_TYPE_NOT_FOUND` | 404 |

## Checklist frontend (rápido)

- [ ] Normalizar el error HTTP con fallback a `INTERNAL_SERVER_ERROR` si falta `code`.
- [ ] Resolver UX por `code`, no por matching de strings en `message`.
- [ ] Registrar `message`/`details` solo para diagnóstico (sin acoplar lógica).
- [ ] Tratar `500` y `INTERNAL_SERVER_ERROR` como error genérico recuperable.
- [ ] Mantener un mapa local `code -> traducción/acción` versionado con frontend.

## Referencia técnica backend

- `src/errors/AppError.js`
- `src/middleware/errorHandler.js`
- `src/errors/AppError.test.js`
- `src/middleware/errorHandler.test.js`

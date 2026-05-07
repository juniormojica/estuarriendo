# Proposal: Auth Controller AppError Migration

## Intent

Cerrar la brecha pendiente del cambio `backend-app-error`: hoy la semántica de errores de autenticación existe en `AppError`, pero `authController` todavía serializa errores por su cuenta y no prueba el flujo centralizado.

## Scope

### In Scope
- Migrar `backend/src/controllers/authController.js` para reenviar errores con `next(error)` y quitar `handleError` local.
- Mantener validaciones inline y respuestas/cookies exitosas existentes, salvo ajustes mínimos necesarios para el contrato de error migrado.
- Permitir ajustes chicos en soporte directo (`authService` y/o tests del controller) solo si hacen falta para conservar status y mensajes actuales.

### Out of Scope
- Migrar otros controllers o refactorizar todo `authService`.
- Cambiar rutas públicas, payloads exitosos, cookies, JWT o flujo de Google OAuth más allá del manejo de errores.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `backend-error-handling`: extender la adopción incremental para que al menos un flujo de `authController` cumpla el contrato centralizado con status de auth no-500.

## Approach

Adoptar el mismo patrón del piloto previo: controller Express 4 con `(req, res, next)`, `catch` que delega al `errorHandler`, y clasificación mínima donde hoy solo existen `Error` con `statusCode`. Preservar mensajes seguros y semántica HTTP actual; si una validación local ya es segura y estable, puede seguir inline.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/controllers/authController.js` | Modified | Quitar serialización local y delegar errores migrados al middleware. |
| `backend/src/services/authService.js` | Modified | Ajustes mínimos de clasificación solo donde el controller migrado los necesite. |
| `backend/src/controllers/*.test.js` | Modified/New | Evidencia chica del flujo auth → `errorHandler` si hace falta. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Cambiar forma de error consumida por frontend auth | Med | Mantener `error`, `message`, status y mensajes seguros compatibles. |
| Romper semántica de seguridad en login/reset/google | Med | Limitar el cambio al manejo de errores; no tocar éxito, cookies ni tokens. |

## Rollback Plan

Revertir la migración de `authController` y cualquier clasificación mínima asociada; el controller puede volver a `handleError` sin afectar el middleware global existente.

## Dependencies

- `backend-app-error` ya archivado y disponible como base.

## Success Criteria

- [ ] `authController` deja de serializar errores con `handleError`.
- [ ] Un flujo auth migrado devuelve status no-500 y cuerpo estándar vía `errorHandler`.
- [ ] Registro, login, reset y Google conservan comportamiento público y seguridad existentes fuera del cambio de contrato de error.

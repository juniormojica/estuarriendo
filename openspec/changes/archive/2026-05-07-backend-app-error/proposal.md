# Proposal: Backend AppError Contract

## Intent

Reducir el manejo de errores duplicado en controllers y definir un contrato HTTP consistente para errores del backend, sin mezclar esta mejora con una refactorización masiva.

## Scope

### In Scope
- Introducir `AppError` como error base reutilizable para status, código y mensaje seguro.
- Agregar middleware centralizado de errores y conectarlo en `backend/src/server.js`.
- Migrar una superficie piloto pequeña para probar el patrón sin tocar todos los controllers.

### Out of Scope
- Refactor completo de repositories/controllers del backend.
- Migración completa a TypeScript.
- Migración completa a un framework de validación.

## Capabilities

### New Capabilities
- `backend-error-handling`: contrato estándar de errores HTTP para backend Express, con `AppError`, middleware centralizado y adopción piloto.

### Modified Capabilities
- None.

## Approach

Crear utilidades de error dedicadas, enrutar los errores con `next(error)` y centralizar la traducción a respuestas HTTP. Adaptar primero un piloto chico (por ejemplo `authController.js` y/o `userController.js`) y dejar el resto para cambios posteriores. Mapear con cuidado errores conocidos de auth/Sequelize para no perder semántica.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/errors/` o `backend/src/utils/` | New | `AppError` y helpers de clasificación/serialización |
| `backend/src/middleware/` | New | Middleware centralizado de error |
| `backend/src/server.js` | Modified | Wiring del middleware y orden final de handlers |
| `backend/src/controllers/authController.js` | Modified | Piloto para eliminar `handleError` local |
| `backend/src/controllers/userController.js` | Modified | Piloto opcional para validar patrón en controller simple |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Cambio de contrato consumido por frontend | Med | Mantener forma mínima compatible y documentar campos nuevos |
| Tragar errores de Sequelize/auth y devolver 500 genérico | Med | Mapear errores conocidos y dejar fallback explícito con logging |
| Convertir el cambio en refactor masivo | High | Limitar el piloto a pocos controllers y deferir migraciones restantes |

## Rollback Plan

Revertir el wiring del middleware y la migración piloto; los controllers no migrados seguirán funcionando con su manejo actual. Si el contrato rompe consumidores, restaurar la respuesta previa en el middleware y dejar `AppError` fuera del flujo público.

## Dependencies

- Ninguna dependencia nueva obligatoria.

## Success Criteria

- [ ] Existe un contrato único de error backend definido para este cambio.
- [ ] El servidor usa middleware centralizado para al menos una superficie piloto.
- [ ] El piloto elimina `handleError` duplicado sin expandir el cambio a todo el backend.
- [ ] Los errores esperados de negocio siguen devolviendo status coherentes para frontend.

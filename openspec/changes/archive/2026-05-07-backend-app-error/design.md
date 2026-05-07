# Design: Backend AppError Contract

## Technical Approach

Add a small backend error layer that fits the current Express ES Modules architecture: services throw classified errors, migrated controllers forward with `next(error)`, and a final middleware serializes safe JSON. This implements `backend-error-handling` while preserving existing non-migrated controller behavior.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Error location | Create `backend/src/errors/AppError.js` | Put it in `utils/` or inside middleware | `errors/` names the domain clearly and avoids mixing response formatting with generic utilities. |
| Error shape | `statusCode`, `code`, `message`, `isOperational=true`, optional `details`, optional `cause`; helper factories like `badRequest`, `unauthorized`, `notFound`, `conflict` | Keep ad-hoc `error.statusCode`; subclass per every case | Preserves current status behavior while adding stable machine codes without creating a large class hierarchy. |
| Response contract | `{ error: message, message, code }`, plus `details` only for safe classified errors | Replace `error` with only `message`; expose stack in dev | Keeping both `error` and `message` protects existing frontend consumers that read either field. Stack traces stay out of public JSON. |
| Controller forwarding | Migrated controllers use `(req, res, next)` and `catch (error) { next(error); }`; immediate validation may either throw/next `AppError` or return unchanged until migrated | Continue local `handleError`; wrap all async routes globally | Explicit `next(error)` matches Express 4 and avoids a risky framework-wide async wrapper. |
| Pilot scope | Migrate `userController.js` first, then `authController.js` in the same change only if size stays small | Start with all controllers; start with auth only | `userService.js` already has `ValidationError`, `NotFoundError`, `ConflictError`, making it the cleanest proof. `authController.js` is valuable but riskier because cookies, Google OAuth, and password reset are user-facing. |

## Data Flow

```text
Route → migrated Controller → Service/Repository
                         │          │
                         │          └─ throws AppError or legacy statusCode Error
                         └─ catch → next(error)
                                      ↓
                         errorHandler middleware → safe JSON response
```

Non-migrated controllers continue sending local responses and will not be forced into the new contract.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/src/errors/AppError.js` | Create | Defines `AppError` and named factory helpers. |
| `backend/src/middleware/errorHandler.js` | Create | Converts `AppError` and legacy `statusCode` errors into the standard response; logs unexpected errors. |
| `backend/src/server.js` | Modify | Import and mount `errorHandler` after API routes; keep 404 behavior compatible. |
| `backend/src/services/userService.js` | Modify | Replace local error classes with `AppError`-based equivalents or factories. |
| `backend/src/controllers/userController.js` | Modify | Remove local `handleError`; add `next` and forward caught errors. |
| `backend/src/controllers/authController.js` | Modify/defer | Migrate after user pilot if small; otherwise document as next rollout slice. |
| `backend/package.json` | Modify if testing now | Add minimal Vitest scripts/dev deps only if tests are included in the work unit. |

## Interfaces / Contracts

```js
new AppError(message, statusCode, code, { details, cause } = {})
```

Standard migrated response:

```json
{ "error": "User not found", "message": "User not found", "code": "USER_NOT_FOUND" }
```

Unexpected response:

```json
{ "error": "Error interno del servidor", "message": "Error interno del servidor", "code": "INTERNAL_SERVER_ERROR" }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `AppError` properties and middleware serialization | Add minimal Vitest setup because backend currently has only a failing placeholder `test` script. |
| Integration | `userController` not-found/validation/conflict responses | Prefer Supertest against `app`, but `server.js` currently starts listeners on import, so either refactor app creation later or defer integration. |
| E2E | Frontend compatibility | Defer; this change is backend contract groundwork. |

Recommendation: add minimal `vitest` unit tests now for `AppError` and `errorHandler`; defer Supertest until server bootstrap is separated from app export.

## Migration / Rollout

No data migration required. Roll out incrementally: create shared error layer, migrate `userController`, verify response compatibility, then migrate `authController` only if the diff remains reviewable. Controllers not touched keep their local `res.status(...).json(...)` behavior.

## Open Questions

- None blocking.

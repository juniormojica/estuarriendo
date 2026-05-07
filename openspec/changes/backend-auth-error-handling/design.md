# Design: Auth Controller AppError Migration

## Technical Approach

Migrate `backend/src/controllers/authController.js` to the established Express 4 error path: each exported handler accepts `(req, res, next)`, preserves successful responses/cookies, and forwards caught errors with `next(error)`. Remove the controller-local `handleError`; let `backend/src/middleware/errorHandler.js` serialize `AppError` and legacy operational `statusCode` errors.

Inline request validation can stay in the controller as direct `res.status(...).json(...)` responses for now, because the proposal permits stable inline validations and the scope is the error delegation contract, not full validation refactoring.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Controller error path | Replace `catch { handleError(...) }` with `catch { next(error) }` across auth handlers. | Keep local `handleError`; wrap every handler in a new helper. | Matches the `userController` pilot and uses the already-mounted global `errorHandler` in `server.js`. |
| Service error model | Keep existing `Error` + `statusCode` throws in `authService` and `googleAuthService` unless a touched path needs a specific code/detail. | Convert all auth service errors to `AppError` immediately. | `errorHandler` already bridges 4xx `statusCode` errors safely; broad conversion increases regression risk without changing public behavior. Use `AppError` only for new/changed classifications. |
| Google email conflict | Prefer forwarding a classified error instead of serializing 409 inline when changing `googleAuth`. | Leave existing inline `res.status(409)`. | The migrated controller boundary should demonstrate centralized auth error handling beyond service rejections. This can be done with `conflict(message, { code: 'AUTH_GOOGLE_EMAIL_CONFLICT' })` or a legacy `statusCode = 409`; `AppError` is clearer for newly touched controller classification. |
| Unexpected errors | Do not preserve `handleError`'s `message: error.message` for 500s. | Keep exposing unexpected `error.message`. | Spec requires sanitized 500 responses; global handler returns `Error interno del servidor` and logs server-side. |

## Data Flow

    authRoutes ──→ authController(req,res,next) ──→ authService / googleAuthService / models
                         │ success                          │
                         ├──────────────→ res.cookie/json    │
                         │ error                            │
                         └──────────────→ next(error) ──→ errorHandler ──→ standard JSON

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/src/controllers/authController.js` | Modify | Remove local `handleError`, add `next` parameter to exported handlers, forward caught errors, preserve success behavior and inline validation responses. Import `conflict` from `../errors/AppError.js` only if converting the Google email conflict to centralized handling. |
| `backend/src/services/authService.js` | Modify minimally | Keep legacy classified errors; optionally convert only touched/auth-specific errors to `AppError` if tests need explicit `code`. No repository/model reshaping. |
| `backend/src/services/googleAuthService.js` | Modify minimally | Keep current 401 `statusCode` errors unless adding explicit `AppError` codes is necessary. |
| `backend/src/controllers/authController.error-flow.test.js` | Create | Mirror `userController.error-flow.test.js` with mocked services and `errorHandler` to prove auth forwards expected and unexpected errors. |

## Interfaces / Contracts

No route, payload, JWT, or cookie contract changes for successful auth flows.

Centralized error response for migrated thrown errors:

```js
{ error: message, message, code }
```

Expected legacy `statusCode` errors keep their HTTP status and message with `code: 'OPERATIONAL_ERROR'`. New `AppError` classifications may provide auth-specific codes. Unexpected errors become status `500` with generic message/code.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Controller unit/error-flow | Auth handler forwards service `statusCode` or `AppError` to `errorHandler` and gets standard body/status. | Vitest mocks for `authService`, `verifyGoogleToken`, `User`; use the same `runThroughErrorHandler` pattern as user pilot. |
| Controller sanitization | Unexpected auth failure returns generic 500, not raw DB/token message. | Mock a rejected `Error('Sequelize...')`, then invoke `errorHandler`. |
| Success preservation | Login/register/google success still sets/clears cookies and returns existing payload/status. | Lightweight controller tests with mocked dependencies; no DB integration required. |

## Migration / Rollout

No data migration required. Rollout is code-only and reversible by restoring local auth error serialization.

## Open Questions

None.

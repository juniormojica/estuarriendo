# Tasks: Backend AppError Contract

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 260-360 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR with test-first foundation |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add error foundation, pilot migration, and unit tests | PR 1 | Keep `authController.js` deferred unless diff stays tiny after user pilot |

## Phase 1: Investigation + Test Harness

- [x] 1.1 Confirm current backend error flow in `backend/src/server.js`, `backend/src/controllers/userController.js`, and `backend/src/services/userService.js`; note root-cause gaps before changing code.
- [x] 1.2 Add minimal backend Vitest setup in `backend/package.json` and create only the smallest config/bootstrap file needed for ESM unit tests.

## Phase 2: RED Tests for New Contract

- [x] 2.1 Write failing unit tests for `backend/src/errors/AppError.js` covering constructor shape, helper factories, and stable `code/statusCode` values.
- [x] 2.2 Write failing unit tests for `backend/src/middleware/errorHandler.js` covering classified JSON shape, legacy `error.statusCode` bridging, and sanitized 500 responses.

## Phase 3: Foundation Implementation

- [x] 3.1 Create `backend/src/errors/AppError.js` with `AppError` plus `badRequest`, `unauthorized`, `notFound`, and `conflict` helpers.
- [x] 3.2 Create `backend/src/middleware/errorHandler.js` to serialize `{ error, message, code }`, expose safe `details` only for operational errors, and log unexpected failures.
- [x] 3.3 Wire `backend/src/server.js` to use the new middleware after routes while keeping existing 404 handling compatible for non-migrated endpoints.

## Phase 4: Pilot Migration

- [x] 4.1 Update `backend/src/services/userService.js` to replace local error classes with `AppError` semantics or a thin bridge that preserves 400/404/409 behavior.
- [x] 4.2 Migrate `backend/src/controllers/userController.js` to `(req, res, next)`, remove `handleError`, and forward caught service errors with `next(error)`.
- [x] 4.3 Re-check `backend/src/controllers/authController.js`; keep it deferred unless the remaining migration is clearly tiny and still inside the review budget. (Deferred intentionally to avoid scope/risk expansion.)

## Phase 5: Verification

- [x] 5.1 Run backend unit tests for the new AppError and middleware files; confirm RED→GREEN coverage for spec scenarios on standard shape and sanitized 500s.
- [x] 5.2 Manually verify the `userController` pilot still returns compatible status/message behavior for validation, not-found, and conflict flows without running a production build.
- [x] 5.3 Add runtime behavioral tests for migrated `userController` + `errorHandler` flow (validation/not-found/conflict) and executable boundary evidence that already-sent non-migrated local responses are not rewritten.

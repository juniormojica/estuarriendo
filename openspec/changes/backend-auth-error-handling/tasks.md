# Tasks: Auth Controller AppError Migration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 220-320 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Migrate auth error flow with focused controller tests | Single PR | Keep service tweaks minimal; include task progress + drift notes. |

## Phase 1: Test Harness

- [x] 1.1 Create `backend/src/controllers/authController.error-flow.test.js` with `createResponse` and `runThroughErrorHandler`, mirroring `userController.error-flow.test.js`.
- [x] 1.2 Add RED tests for one expected auth 4xx path and one unexpected 500 path through `backend/src/middleware/errorHandler.js`.
- [x] 1.3 Add success-preservation tests for `register`, `login`, or `googleAuth` cookies/status/payloads with mocked dependencies.

## Phase 2: Controller Migration

- [x] 2.1 Update `backend/src/controllers/authController.js` handlers to `(req, res, next)`, remove local `handleError`, and forward caught errors with `next(error)`.
- [x] 2.2 Keep existing inline 400 validations local; preserve successful response and cookie behavior for register/login/logout/reset/google flows.
- [x] 2.3 Replace the inline Google email-conflict `409` response with a forwarded classified error from `../errors/AppError.js` or equivalent safe 409 classification.

## Phase 3: Minimal Support Wiring

- [x] 3.1 Touch `backend/src/services/authService.js` or `backend/src/services/googleAuthService.js` only if tests require explicit `code` or status preservation.
- [x] 3.2 Reuse the existing `backend/src/middleware/errorHandler.js` contract; do not reshape routes, repositories, models, or non-auth controllers.

## Phase 4: Verification and Artifact Updates

- [x] 4.1 Verify the checklist covers spec scenarios: expected auth 4xx standard body, unexpected auth 500 sanitization, and success-flow preservation.
- [x] 4.2 During `sdd-apply`, update `openspec/changes/backend-auth-error-handling/tasks.md` checkboxes and record any spec/design drift before `sdd-verify`.

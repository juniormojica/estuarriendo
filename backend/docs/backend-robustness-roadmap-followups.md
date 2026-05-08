# Backend Robustness Roadmap — Follow-up Work Units

This file documents only the remaining roadmap units after slice 1.

## Work Unit A — Request IDs and structured logging
- Add request identifier middleware.
- Propagate request id through request/error logs.

## Work Unit B — Request validation boundary
- Add schema validation middleware for body/params/query.
- Prevent controller execution when validation fails.

## Work Unit C — Controller error unification
- Standardize `next(error)` handoff across legacy controllers.
- Remove remaining ad-hoc `res.status(...).json(...)` error paths where applicable.

## Work Unit D — Repository backfill
- Move direct model access in pending controllers/services behind repositories.
- Keep `Routes → Controllers → Services → Repositories → Models` contract explicit.

## Work Unit E — Runtime resilience
- Add DB connection retry strategy for startup.
- Add graceful HTTP shutdown window for in-flight requests.

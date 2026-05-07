# Delta for Backend Error Handling

## ADDED Requirements

### Requirement: Auth Controller Centralized Error Contract

Migrated `authController` error responses MUST follow the centralized backend error contract for expected and unexpected authentication flows. Expected auth failures MUST preserve their existing HTTP status and safe public message semantics.

#### Scenario: Expected auth error uses standard response

- GIVEN an auth endpoint encounters an expected authentication, validation, or authorization failure
- WHEN the client receives the response
- THEN the status MUST match the status used before this migration
- AND the body MUST be a safe JSON error response compatible with the standard contract.

#### Scenario: Unexpected auth failure is sanitized

- GIVEN an auth endpoint encounters an unclassified failure
- WHEN the client receives the response
- THEN the status MUST be 500
- AND the body MUST NOT expose stack traces, SQL, file paths, secrets, tokens, or implementation details.

### Requirement: Auth Success Flow Preservation

Successful auth flows MUST remain behaviorally unchanged by this migration. Cookie issuance/clearing, JWT delivery, response status, and response payload semantics MUST remain compatible with the existing public API.

#### Scenario: Successful cookie and JWT flow remains unchanged

- GIVEN a registration, login, logout, password reset, or Google auth request succeeds
- WHEN the client receives the response
- THEN cookies, JWT behavior, status, and public payload semantics MUST remain compatible with the existing flow.

## MODIFIED Requirements

### Requirement: Incremental Adoption Boundary

Centralized error handling MUST support incremental adoption by migrated controllers. For this change, auth controller error flows are within the migrated boundary; non-auth controllers are out of scope and MUST NOT be required to change behavior.
(Previously: only the earlier pilot boundary was required to follow the centralized contract.)

#### Scenario: Migrated auth uses centralized contract

- GIVEN an auth controller flow is included in this migration
- WHEN it produces an expected or unexpected error
- THEN the response MUST follow this specification.

#### Scenario: Non-auth controller remains out of scope

- GIVEN a non-auth controller has not been migrated in this change
- WHEN it handles an error using its existing behavior
- THEN this capability MUST NOT require its response to match the new auth error behavior.

# Backend Error Handling Specification

## Purpose

Define the backend HTTP error contract for expected errors, unexpected failures, and incremental controller adoption without changing non-migrated controller behavior.

## Requirements

### Requirement: Standard Error Response Contract

For migrated error flows, the system MUST return a consistent JSON error response for failed HTTP requests. The response MUST include a safe human-readable message and a stable machine-readable error code. The response SHOULD preserve compatibility for frontend consumers that already read an error message field.

#### Scenario: Expected error returns standard shape

- GIVEN a migrated backend endpoint encounters a classified expected error
- WHEN the client receives the HTTP response
- THEN the response body MUST include a safe message and stable error code
- AND the response MUST remain JSON.

#### Scenario: Frontend-compatible message remains available

- GIVEN a frontend consumer reads a message from backend error responses
- WHEN a migrated pilot endpoint returns an error
- THEN the response MUST expose a safe message field usable by that consumer.

### Requirement: Classified Errors Use Non-500 Status Codes

The system MUST return a non-500 HTTP status for expected business, validation, authentication, or authorization errors when they are classified. The status code MUST match the error category closely enough for frontend handling.

#### Scenario: Validation error does not return 500

- GIVEN a migrated endpoint receives invalid client input
- WHEN the validation failure is classified
- THEN the response status MUST be a client-error status, not 500
- AND the response MUST include the standard error body.

#### Scenario: Authentication error does not return 500

- GIVEN a migrated endpoint rejects a request for authentication reasons
- WHEN the authentication failure is classified
- THEN the response status MUST be an authentication/authorization client-error status, not 500
- AND the response MUST include the standard error body.

### Requirement: Unexpected Error Safety

The system MUST handle unexpected errors without leaking sensitive implementation details. Public responses for unexpected failures MUST use a generic safe message and server-error status.

#### Scenario: Unexpected failure is sanitized

- GIVEN a migrated error flow encounters an unclassified exception
- WHEN the client receives the HTTP response
- THEN the response status MUST be 500
- AND the response body MUST NOT expose stack traces, SQL, file paths, secrets, or internal implementation details.

### Requirement: Incremental Adoption Boundary

Centralized error handling MUST support incremental adoption by migrated controllers. Non-migrated controllers are out of scope for this change and MUST NOT be required to change behavior as part of this capability.

#### Scenario: Migrated pilot uses centralized contract

- GIVEN a controller is included in the pilot migration
- WHEN it produces an error through the migrated flow
- THEN the response MUST follow this specification.

#### Scenario: Non-migrated controller remains out of scope

- GIVEN a controller has not been migrated in this change
- WHEN it handles an error using its existing behavior
- THEN this capability MUST NOT require its response to match the new contract.

### Requirement: Pilot Consumer Compatibility

Pilot controller errors MUST remain compatible enough for existing frontend consumers. Any newly added fields MAY be present, but existing consumers SHOULD be able to continue making decisions from HTTP status and safe message.

#### Scenario: Pilot error remains consumable

- GIVEN an existing frontend flow calls a migrated pilot endpoint
- WHEN the endpoint returns an expected error
- THEN the frontend MUST still be able to identify failure from status and display a safe message
- AND additional error fields MUST NOT make the response invalid JSON.

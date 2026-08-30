# Execution workflow

Execution follows a controlled state machine:

`DRAFT -> READY -> APPROVAL_PENDING -> APPROVED -> IN_PROGRESS -> COMPLETED`

Cancellation is allowed from non-terminal states. Terminal states cannot be mutated. Invalid actions are rejected with a deterministic error code.

## Work Order Workflow

FlowOps models work orders as an explicit state machine:

NEW → ASSIGNED → IN_PROGRESS → IN_REVIEW → COMPLETED

An ADMIN can return an IN_REVIEW order to IN_PROGRESS by
requesting changes with a required reason.

Business workflow transitions are exposed through:

POST /work-orders/:id/transitions

Supported actions:

- START
- SUBMIT_FOR_REVIEW
- REQUEST_CHANGES
- APPROVE

Assignment remains a separate business operation:

POST /work-orders/:id/assign

All transitions validate role, ownership and current state,
and persist status changes together with their audit history
inside a database transaction.
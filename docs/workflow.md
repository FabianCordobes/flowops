# FlowOps Work Order Workflow

## States

NEW
→ ASSIGNED
→ IN_PROGRESS
→ IN_REVIEW
→ COMPLETED

An ADMIN may request changes while a work order is IN_REVIEW,
returning it to IN_PROGRESS.

## Assignment

Assignment is handled separately from workflow transitions:

POST /work-orders/:id/assign

Only ADMIN users may assign work orders.

Assignment performs:

NEW → ASSIGNED

and sets the assigned operator.

## Workflow transitions

Workflow actions use:

POST /work-orders/:id/transitions

### START

Actor: assigned OPERATOR

ASSIGNED → IN_PROGRESS

### SUBMIT_FOR_REVIEW

Actor: assigned OPERATOR

IN_PROGRESS → IN_REVIEW

### REQUEST_CHANGES

Actor: ADMIN

IN_REVIEW → IN_PROGRESS

A reason is required.

### APPROVE

Actor: ADMIN

IN_REVIEW → COMPLETED

COMPLETED is a final state.

## Audit history

Every successful transition creates a
work_order_status_history record containing:

- previous status
- new status
- actor
- reason
- timestamp

The work order update and history insertion are executed
inside the same database transaction.
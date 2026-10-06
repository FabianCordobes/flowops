# FlowOps Workflow

## Roles

### ADMIN

Can:

- Create work orders
- Edit work orders
- Assign operators
- View all work orders
- Change allowed statuses
- View work order history

### OPERATOR

Can:

- View assigned work orders
- Start assigned work
- Block assigned work
- Resume blocked work
- Complete assigned work
- Add comments

---

## Work Order Statuses

NEW

A newly created work order without an assigned operator.

NEW -> ASSIGNED

Requires an operator.

---

ASSIGNED

The work order has an operator assigned.

ASSIGNED -> IN_PROGRESS

Allowed for:

- Assigned operator
- Admin

---

IN_PROGRESS

Work is currently being performed.

Possible transitions:

IN_PROGRESS -> BLOCKED

Requires a reason.

IN_PROGRESS -> COMPLETED

Allowed for:

- Assigned operator
- Admin

---

BLOCKED

Work cannot continue temporarily.

BLOCKED -> IN_PROGRESS

Allowed for:

- Assigned operator
- Admin

---

COMPLETED

Final state in the MVP.

No transitions are allowed from COMPLETED.
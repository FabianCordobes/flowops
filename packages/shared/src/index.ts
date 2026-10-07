export const UserRole = {
    ADMIN: 'ADMIN',
    OPERATOR: 'OPERATOR',
  } as const;

  export type UserRole = (typeof UserRole)[keyof typeof UserRole];

  export const WorkOrderStatus = {
    NEW: 'NEW',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    IN_REVIEW: 'IN_REVIEW',
    COMPLETED: 'COMPLETED',
  } as const;

  export type WorkOrderStatus =
    (typeof WorkOrderStatus)[keyof typeof WorkOrderStatus];

    export const WorkOrderAction = {
        START: 'START',
        SUBMIT_FOR_REVIEW: 'SUBMIT_FOR_REVIEW',
        REQUEST_CHANGES: 'REQUEST_CHANGES',
        APPROVE: 'APPROVE',
      } as const;

      export type WorkOrderAction =
        (typeof WorkOrderAction)[keyof typeof WorkOrderAction];

  export const WorkOrderPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  } as const;

  export type WorkOrderPriority =
    (typeof WorkOrderPriority)[keyof typeof WorkOrderPriority];
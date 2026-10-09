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

    // =====================================================
// FlowOps V2 — Spaces
// =====================================================

export const SpaceType = {
  PERSONAL: 'PERSONAL',
  ORGANIZATION: 'ORGANIZATION',
} as const;

export type SpaceType =
  (typeof SpaceType)[keyof typeof SpaceType];

export const SpaceRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export type SpaceRole =
  (typeof SpaceRole)[keyof typeof SpaceRole];

export const SpaceView = {
  LIST: 'LIST',
  BOARD: 'BOARD',
} as const;

export type SpaceView =
  (typeof SpaceView)[keyof typeof SpaceView];

// =====================================================
// FlowOps V2 — Projects
// =====================================================

export const ProjectStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ProjectStatus =
  (typeof ProjectStatus)[keyof typeof ProjectStatus];

// =====================================================
// FlowOps V2 — Tasks
// =====================================================

export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export type TaskStatus =
  (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type TaskPriority =
  (typeof TaskPriority)[keyof typeof TaskPriority];

// =====================================================
// FlowOps V2 — Workflow
// =====================================================

export const WorkflowMode = {
  SIMPLE: 'SIMPLE',
  ADVANCED: 'ADVANCED',
} as const;

export type WorkflowMode =
  (typeof WorkflowMode)[keyof typeof WorkflowMode];
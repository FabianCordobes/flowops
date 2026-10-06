export enum UserRole {
    ADMIN = 'ADMIN',
    OPERATOR = 'OPERATOR',
  }
  
  export enum WorkOrderStatus {
    NEW = 'NEW',
    ASSIGNED = 'ASSIGNED',
    IN_PROGRESS = 'IN_PROGRESS',
    BLOCKED = 'BLOCKED',
    COMPLETED = 'COMPLETED',
  }
  
  export enum WorkOrderPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
  }
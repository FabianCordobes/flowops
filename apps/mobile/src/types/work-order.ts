export type WorkOrderStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'COMPLETED';

export type WorkOrderPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export type WorkOrderAction =
  | 'START'
  | 'SUBMIT_FOR_REVIEW'
  | 'REQUEST_CHANGES'
  | 'APPROVE';

export type WorkOrder = {
  id: string;
  title: string;
  description: string | null;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  createdBy: string;
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkOrderInput = {
    title: string;
    description?: string;
    priority?: WorkOrderPriority;
    dueDate?: string;
  };

  export type WorkOrderStatusHistory = {
    id: string;
    workOrderId: string;
    fromStatus: WorkOrderStatus | null;
    toStatus: WorkOrderStatus;
    changedBy: string;
    changedByProfile: {
      id: string;
      fullName: string | null;
      email: string;
      role: 'ADMIN' | 'OPERATOR';
    };
    reason: string | null;
    createdAt: string;
  };
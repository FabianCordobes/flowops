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

  export type WorkOrderStatusFilter =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'COMPLETED';

export type WorkOrderPriorityFilter =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export type WorkOrderSort = 'newest' | 'oldest';

export type WorkOrderFilters = {
  status?: WorkOrderStatusFilter;
  priority?: WorkOrderPriorityFilter;
  search?: string;
  sort?: WorkOrderSort;
};

export type WorkOrderComment = {
  id: string;
  workOrderId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    fullName: string | null;
  };
};

export type CreateWorkOrderCommentInput = {
  content: string;
};

export type WorkOrdersDashboard = {
  total: number;
  new: number;
  assigned: number;
  inProgress: number;
  inReview: number;
  completed: number;
  overdue: number;
  recentOrders: WorkOrder[];
};
import { apiRequest } from '../lib/api';
import type {
  CreateWorkOrderCommentInput,
  CreateWorkOrderInput,
  WorkOrder,
  WorkOrderAction,
  WorkOrderComment,
  WorkOrderFilters,
  WorkOrderStatusHistory,
} from '../types/work-order';

export const getWorkOrders = (
  filters: WorkOrderFilters = {},
): Promise<WorkOrder[]> => {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.priority) {
    params.set('priority', filters.priority);
  }

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim());
  }

  if (filters.sort) {
    params.set('sort', filters.sort);
  }

  const queryString = params.toString();

  return apiRequest<WorkOrder[]>(
    `/work-orders${queryString ? `?${queryString}` : ''}`,
  );
};
export const getWorkOrder = (id: string): Promise<WorkOrder> => {
  return apiRequest<WorkOrder>(`/work-orders/${id}`);
};

export const transitionWorkOrder = (
  id: string,
  action: WorkOrderAction,
  reason?: string,
): Promise<WorkOrder> => {
  return apiRequest<WorkOrder>(
    `/work-orders/${id}/transitions`,
    {
      method: 'POST',
      body: JSON.stringify({
        action,
        ...(reason ? { reason } : {}),
      }),
    },
  );
};

export const createWorkOrder = (
    input: CreateWorkOrderInput,
  ): Promise<WorkOrder> => {
    return apiRequest<WorkOrder>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  };

  export const assignWorkOrder = (
    id: string,
    operatorId: string,
  ): Promise<WorkOrder> => {
    return apiRequest<WorkOrder>(`/work-orders/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({
        operatorId,
      }),
    });
  };

  export const getWorkOrderHistory = (
    id: string,
  ): Promise<WorkOrderStatusHistory[]> => {
    return apiRequest<WorkOrderStatusHistory[]>(
      `/work-orders/${id}/history`,
    );
  };

  export const getWorkOrderComments = (
    id: string,
  ): Promise<WorkOrderComment[]> => {
    return apiRequest<WorkOrderComment[]>(
      `/work-orders/${id}/comments`,
    );
  };

  export const createWorkOrderComment = (
    id: string,
    input: CreateWorkOrderCommentInput,
  ): Promise<WorkOrderComment> => {
    return apiRequest<WorkOrderComment>(
      `/work-orders/${id}/comments`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    );
  };
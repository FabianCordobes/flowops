import { apiRequest } from '../lib/api';
import type {
    CreateWorkOrderInput,
  WorkOrder,
  WorkOrderAction,
  WorkOrderStatusHistory,
} from '../types/work-order';

export const getWorkOrders = (): Promise<WorkOrder[]> => {
  return apiRequest<WorkOrder[]>('/work-orders');
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
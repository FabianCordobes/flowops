import type { WorkOrder } from '../entities/work-order.entity.js';

export type WorkOrdersDashboardResponseDto = {
  total: number;
  new: number;
  assigned: number;
  inProgress: number;
  inReview: number;
  completed: number;
  overdue: number;
  recentOrders: WorkOrder[];
};
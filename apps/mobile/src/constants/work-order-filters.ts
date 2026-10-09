import type {
    WorkOrderPriorityFilter,
    WorkOrderStatusFilter,
  } from '../types/work-order';

  export const WORK_ORDER_STATUS_OPTIONS: ReadonlyArray<{
    label: string;
    value: WorkOrderStatusFilter | undefined;
  }> = [
    { label: 'All', value: undefined },
    { label: 'New', value: 'NEW' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'In progress', value: 'IN_PROGRESS' },
    { label: 'In review', value: 'IN_REVIEW' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  export const WORK_ORDER_PRIORITY_OPTIONS: ReadonlyArray<{
    label: string;
    value: WorkOrderPriorityFilter | undefined;
  }> = [
    { label: 'All priorities', value: undefined },
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Urgent', value: 'URGENT' },
  ];
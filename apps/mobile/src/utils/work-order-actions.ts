import type { UserRole } from '../types/auth';
import type {
  WorkOrderAction,
  WorkOrderStatus,
} from '../types/work-order';

export type AvailableWorkOrderAction = {
  action: WorkOrderAction;
  label: string;
  requiresReason?: boolean;
};

export const getAvailableWorkOrderActions = (
  role: UserRole,
  status: WorkOrderStatus,
): AvailableWorkOrderAction[] => {
  if (role === 'OPERATOR') {
    if (status === 'ASSIGNED') {
      return [
        {
          action: 'START',
          label: 'Start work',
        },
      ];
    }

    if (status === 'IN_PROGRESS') {
      return [
        {
          action: 'SUBMIT_FOR_REVIEW',
          label: 'Submit for review',
        },
      ];
    }

    return [];
  }

  if (role === 'ADMIN' && status === 'IN_REVIEW') {
    return [
      {
        action: 'REQUEST_CHANGES',
        label: 'Request changes',
        requiresReason: true,
      },
      {
        action: 'APPROVE',
        label: 'Approve',
      },
    ];
  }

  return [];
};
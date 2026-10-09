import type {
    WorkOrderPriorityFilter,
    WorkOrderSort,
    WorkOrderStatusFilter,
  } from './work-order';

  export type WorkOrdersFiltersProps = {
    status?: WorkOrderStatusFilter;
    priority?: WorkOrderPriorityFilter;
    sort: WorkOrderSort;
    search: string;
    hasActiveFilters: boolean;

    onStatusChange: (value?: WorkOrderStatusFilter) => void;
    onPriorityChange: (value?: WorkOrderPriorityFilter) => void;
    onSortChange: (value: WorkOrderSort) => void;
    onSearchChange: (value: string) => void;
    onClear: () => void;
  };
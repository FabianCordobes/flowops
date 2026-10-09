import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { WorkOrderPriority, WorkOrderStatus } from '@flowops/shared';

export enum WorkOrderSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class ListWorkOrdersQueryDto {
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsEnum(WorkOrderSort)
  sort?: WorkOrderSort;
}
import { WorkOrderAction } from '@flowops/shared';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class TransitionWorkOrderDto {
  @IsEnum(WorkOrderAction)
  action!: WorkOrderAction;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
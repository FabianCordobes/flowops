import { IsUUID } from 'class-validator';

export class AssignWorkOrderDto {
  @IsUUID()
  operatorId!: string;
}
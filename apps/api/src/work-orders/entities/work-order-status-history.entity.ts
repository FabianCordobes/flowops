import { WorkOrderStatus } from '@flowops/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity.js';
import { WorkOrder } from './work-order.entity.js';

@Entity({ name: 'work_order_status_history' })
export class WorkOrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'work_order_id', type: 'uuid' })
  workOrderId!: string;

  @ManyToOne(
    () => WorkOrder,
    (workOrder) => workOrder.statusHistory,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'work_order_id' })
  workOrder!: WorkOrder;

  @Column({
    name: 'from_status',
    type: 'enum',
    enum: WorkOrderStatus,
    enumName: 'work_order_status',
    nullable: true,
  })
  fromStatus!: WorkOrderStatus | null;

  @Column({
    name: 'to_status',
    type: 'enum',
    enum: WorkOrderStatus,
    enumName: 'work_order_status',
  })
  toStatus!: WorkOrderStatus;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy!: string;

  @ManyToOne(() => Profile, { nullable: false })
  @JoinColumn({ name: 'changed_by' })
  changedByProfile!: Profile;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
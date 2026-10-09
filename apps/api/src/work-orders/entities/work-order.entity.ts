import { WorkOrderStatus, WorkOrderPriority } from '@flowops/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity.js';
import { WorkOrderStatusHistory } from './work-order-status-history.entity.js';
import { WorkOrderComment } from './work-order-comment.entity.js';

@Entity({ name: 'work_orders' })
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: WorkOrderStatus,
    enumName: 'work_order_status',
    default: WorkOrderStatus.NEW,
  })
  status!: WorkOrderStatus;

  @Column({
    type: 'enum',
    enum: WorkOrderPriority,
    enumName: 'work_order_priority',
    default: WorkOrderPriority.MEDIUM,
  })
  priority!: WorkOrderPriority;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @ManyToOne(() => Profile, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  creator!: Profile;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo!: string | null;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee!: Profile | null;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate!: Date | null;

  @OneToMany(() => WorkOrderStatusHistory, (history) => history.workOrder)
  statusHistory!: WorkOrderStatusHistory[];

  @OneToMany(() => WorkOrderComment, (comment) => comment.workOrder)
  comments!: Relation<WorkOrderComment[]>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}

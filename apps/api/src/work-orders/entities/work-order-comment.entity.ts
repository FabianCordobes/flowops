
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import type { Relation } from 'typeorm';
  import { Profile } from '../../profiles/entities/profile.entity.js';
  import { WorkOrder } from './work-order.entity.js';

  @Entity({ name: 'work_order_comments' })
  export class WorkOrderComment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'work_order_id', type: 'uuid' })
    workOrderId!: string;

    @ManyToOne(() => WorkOrder, (workOrder) => workOrder.comments, {
        onDelete: 'CASCADE',
        nullable: false,
      })
      @JoinColumn({ name: 'work_order_id' })
      workOrder!: Relation<WorkOrder>;

    @Column({ name: 'author_id', type: 'uuid' })
    authorId!: string;

    @ManyToOne(() => Profile, { nullable: false })
    @JoinColumn({ name: 'author_id' })
    author!: Profile;

    @Column({ type: 'text' })
    content!: string;

    @CreateDateColumn({
      name: 'created_at',
      type: 'timestamptz',
    })
    createdAt!: Date;
  }

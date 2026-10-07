import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderStatusHistory } from './entities/work-order-status-history.entity.js';
import { WorkOrder } from './entities/work-order.entity.js';
import { WorkOrdersService } from './work-orders.service.js';
import { WorkOrdersController } from './work-orders.controller.js';
import { ProfilesModule } from '../profiles/profiles.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder, WorkOrderStatusHistory]), ProfilesModule],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}

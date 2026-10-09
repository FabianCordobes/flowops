import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole, WorkOrderAction, WorkOrderPriority, WorkOrderStatus } from '@flowops/shared';
import { DataSource } from 'typeorm';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { WorkOrderStatusHistory } from './entities/work-order-status-history.entity.js';
import { WorkOrder } from './entities/work-order.entity.js';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto.js';
import { ListWorkOrdersQueryDto, WorkOrderSort } from './dto/list-work-orders-query.dto.js';
import { WorkOrderComment } from './entities/work-order-comment.entity.js';

type TransitionDefinition = {
    from: WorkOrderStatus;
    to: WorkOrderStatus;
    role: UserRole;
    requiresOwnership?: boolean;
    requiresReason?: boolean;
    historyReason: string;
  };

  const WORK_ORDER_TRANSITIONS: Record<
    WorkOrderAction,
    TransitionDefinition
  > = {
    [WorkOrderAction.START]: {
      from: WorkOrderStatus.ASSIGNED,
      to: WorkOrderStatus.IN_PROGRESS,
      role: UserRole.OPERATOR,
      requiresOwnership: true,
      historyReason: 'Work order started',
    },

    [WorkOrderAction.SUBMIT_FOR_REVIEW]: {
      from: WorkOrderStatus.IN_PROGRESS,
      to: WorkOrderStatus.IN_REVIEW,
      role: UserRole.OPERATOR,
      requiresOwnership: true,
      historyReason: 'Work order submitted for review',
    },

    [WorkOrderAction.REQUEST_CHANGES]: {
      from: WorkOrderStatus.IN_REVIEW,
      to: WorkOrderStatus.IN_PROGRESS,
      role: UserRole.ADMIN,
      requiresReason: true,
      historyReason: 'Changes requested',
    },

    [WorkOrderAction.APPROVE]: {
      from: WorkOrderStatus.IN_REVIEW,
      to: WorkOrderStatus.COMPLETED,
      role: UserRole.ADMIN,
      historyReason: 'Work order approved',
    },
  };

@Injectable()
export class WorkOrdersService {
  constructor(private readonly dataSource: DataSource) {}

  async create(dto: CreateWorkOrderDto, createdBy: string): Promise<WorkOrder> {
    return this.dataSource.transaction(async (manager) => {
      const workOrderRepository = manager.getRepository(WorkOrder);
      const historyRepository = manager.getRepository(WorkOrderStatusHistory);

      const workOrder = workOrderRepository.create({
        title: dto.title,
        description: dto.description ?? null,
        priority: dto.priority ?? WorkOrderPriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        createdBy,
        status: WorkOrderStatus.NEW,
        assignedTo: null,
      });

      const savedWorkOrder = await workOrderRepository.save(workOrder);

      const history = historyRepository.create({
        workOrderId: savedWorkOrder.id,
        fromStatus: null,
        toStatus: WorkOrderStatus.NEW,
        changedBy: createdBy,
        reason: 'Work order created',
      });

      await historyRepository.save(history);

      return savedWorkOrder;
    });
  }

  async findAll(
    userId: string,
    role: UserRole,
    filters: ListWorkOrdersQueryDto = {},
  ): Promise<WorkOrder[]> {
    const repository = this.dataSource.getRepository(WorkOrder);

    const query = repository.createQueryBuilder('workOrder');

    // Preserve role-based access restrictions
    if (role !== UserRole.ADMIN) {
      query.andWhere('workOrder.assignedTo = :userId', {
        userId,
      });
    }

    // Filter by status
    if (filters.status) {
      query.andWhere('workOrder.status = :status', {
        status: filters.status,
      });
    }

    // Filter by priority
    if (filters.priority) {
      query.andWhere('workOrder.priority = :priority', {
        priority: filters.priority,
      });
    }

    // Search by title
    const search = filters.search?.trim();

    if (search) {
      const escapedSearch = search.replace(/[\\%_]/g, '\\$&');

      query.andWhere(
        "workOrder.title ILIKE :search ESCAPE '\\'",
        {
          search: `%${escapedSearch}%`,
        },
      );
    }

    // Sort by creation date
    query.orderBy(
      'workOrder.createdAt',
      filters.sort === WorkOrderSort.OLDEST ? 'ASC' : 'DESC',
    );

    // Stable ordering when timestamps are equal
    query.addOrderBy('workOrder.id', 'ASC');

    return query.getMany();
  }

  async findOne(
    id: string,
    userId: string,
    role: UserRole,
  ): Promise<WorkOrder> {
    const repository = this.dataSource.getRepository(WorkOrder);

    const where =
      role === UserRole.ADMIN
        ? { id }
        : {
            id,
            assignedTo: userId,
          };

    const workOrder = await repository.findOne({
      where,
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async findHistory(
    id: string,
    userId: string,
    role: UserRole,
  ): Promise<WorkOrderStatusHistory[]> {
    await this.findOne(id, userId, role);

    return this.dataSource
      .getRepository(WorkOrderStatusHistory)
      .find({
        where: {
          workOrderId: id,
        },
        relations: {
          changedByProfile: true,
        },
        order: {
          createdAt: 'ASC',
        },
      });
  }

  async update(
    id: string,
    dto: UpdateWorkOrderDto,
  ): Promise<WorkOrder> {
    const workOrderRepository =
      this.dataSource.getRepository(WorkOrder);

    const workOrder = await workOrderRepository.findOne({
      where: { id },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (dto.title !== undefined) {
        const title = dto.title.trim();

        if (!title) {
          throw new BadRequestException(
            'Title cannot be empty',
          );
        }

        workOrder.title = title;
    }

    if (dto.description !== undefined) {
      workOrder.description = dto.description.trim();
    }

    if (dto.priority !== undefined) {
      workOrder.priority = dto.priority;
    }

    if (dto.dueDate !== undefined) {
      workOrder.dueDate = new Date(dto.dueDate);
    }

    return workOrderRepository.save(workOrder);
  }

  async assign(
    id: string,
    operatorId: string,
    changedBy: string,
  ): Promise<WorkOrder> {
    return this.dataSource.transaction(async (manager) => {
      const workOrderRepository = manager.getRepository(WorkOrder);
      const historyRepository = manager.getRepository(
        WorkOrderStatusHistory,
      );

      const workOrder = await workOrderRepository.findOne({
        where: { id },
      });

      if (!workOrder) {
        throw new NotFoundException('Work order not found');
      }

      if (workOrder.status !== WorkOrderStatus.NEW) {
        throw new BadRequestException(
          'Only NEW work orders can be assigned',
        );
      }

      workOrder.assignedTo = operatorId;
      workOrder.status = WorkOrderStatus.ASSIGNED;

      const savedWorkOrder =
        await workOrderRepository.save(workOrder);

      const history = historyRepository.create({
        workOrderId: workOrder.id,
        fromStatus: WorkOrderStatus.NEW,
        toStatus: WorkOrderStatus.ASSIGNED,
        changedBy,
        reason: 'Work order assigned',
      });

      await historyRepository.save(history);

      return savedWorkOrder;
    });
  }

  async transition(
    id: string,
    action: WorkOrderAction,
    actorId: string,
    actorRole: UserRole,
    reason?: string,
  ): Promise<WorkOrder> {
    const definition = WORK_ORDER_TRANSITIONS[action];

    if (!definition) {
      throw new BadRequestException(
        'Invalid work order action',
      );
    }

    if (definition.role !== actorRole) {
      throw new ForbiddenException(
        'You do not have permission to perform this transition',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const workOrderRepository =
        manager.getRepository(WorkOrder);

      const historyRepository =
        manager.getRepository(WorkOrderStatusHistory);

      const workOrder = await workOrderRepository.findOne({
        where: { id },
      });

      if (!workOrder) {
        throw new NotFoundException('Work order not found');
      }

      if (
        definition.requiresOwnership &&
        workOrder.assignedTo !== actorId
      ) {
        throw new NotFoundException('Work order not found');
      }

      if (workOrder.status !== definition.from) {
        throw new BadRequestException(
          `Action ${action} is not allowed from status ${workOrder.status}`,
        );
      }

      const normalizedReason = reason?.trim();

      if (
        definition.requiresReason &&
        !normalizedReason
      ) {
        throw new BadRequestException(
          'Reason is required for this transition',
        );
      }

      const previousStatus = workOrder.status;

      workOrder.status = definition.to;

      const savedWorkOrder =
        await workOrderRepository.save(workOrder);

      const history = historyRepository.create({
        workOrderId: workOrder.id,
        fromStatus: previousStatus,
        toStatus: definition.to,
        changedBy: actorId,
        reason:
          normalizedReason ??
          definition.historyReason,
      });

      await historyRepository.save(history);

      return savedWorkOrder;
    });
  }

  async findComments(
    workOrderId: string,
    userId: string,
    role: UserRole,
  ): Promise<WorkOrderComment[]> {
    await this.findOne(workOrderId, userId, role);

    return this.dataSource
      .getRepository(WorkOrderComment)
      .find({
        where: { workOrderId },
        relations: { author: true },
        order: {
          createdAt: 'ASC',
          id: 'ASC',
        },
      });
  }

  async createComment(
    workOrderId: string,
    userId: string,
    role: UserRole,
    content: string,
  ): Promise<WorkOrderComment> {
    await this.findOne(workOrderId, userId, role);

    const normalizedContent = content.trim();

    if (!normalizedContent || normalizedContent.length > 1000) {
      throw new BadRequestException(
        'Comment must contain between 1 and 1000 characters',
      );
    }

    const repository = this.dataSource.getRepository(WorkOrderComment);

    const comment = repository.create({
      workOrderId,
      authorId: userId,
      content: normalizedContent,
    });

    const savedComment = await repository.save(comment);

    return repository.findOneOrFail({
      where: { id: savedComment.id },
      relations: { author: true },
    });
  }
}

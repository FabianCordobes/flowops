import {
    UserRole,
    WorkOrderAction,
    WorkOrderPriority,
    WorkOrderStatus,
  } from '@flowops/shared';
  import { beforeEach, describe, expect, it, vi } from 'vitest';
  import { DataSource } from 'typeorm';
  import { WorkOrdersService } from './work-orders.service.js';
import { WorkOrderStatusHistory } from './entities/work-order-status-history.entity.js';
  
  describe('WorkOrdersService', () => {
    let service: WorkOrdersService;
  
    const workOrderRepository = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
    };
  
    const historyRepository = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
    };
  
    const manager = {
      getRepository: vi.fn(),
    };
  
    const dataSource = {
      transaction: vi.fn(),
      getRepository: vi.fn(),
    };
  
    beforeEach(() => {
        workOrderRepository.create.mockReset();
        workOrderRepository.save.mockReset();
        workOrderRepository.find.mockReset();
        workOrderRepository.findOne.mockReset();
      
        historyRepository.create.mockReset();
        historyRepository.save.mockReset();
        historyRepository.find.mockReset();
      
        manager.getRepository.mockReset();
      
        dataSource.transaction.mockReset();
        dataSource.getRepository.mockReset();
      
        manager.getRepository
          .mockReturnValueOnce(workOrderRepository)
          .mockReturnValueOnce(historyRepository);
      
          dataSource.getRepository.mockImplementation(
            (entity) => {
              if (entity === WorkOrderStatusHistory) {
                return historyRepository;
              }
          
              return workOrderRepository;
            },
          );
      
        dataSource.transaction.mockImplementation(
          async (callback) => callback(manager),
        );
      
        service = new WorkOrdersService(
          dataSource as unknown as DataSource,
        );
      });
  
    it('should create a work order with NEW status and MEDIUM priority by default', async () => {
      const dto = {
        title: 'Prepare customer onboarding',
      };
  
      const createdBy = 'admin-user-id';
  
      const createdWorkOrder = {
        id: 'work-order-id',
        title: dto.title,
        description: null,
        status: WorkOrderStatus.NEW,
        priority: WorkOrderPriority.MEDIUM,
        createdBy,
        assignedTo: null,
        dueDate: null,
      };
  
      workOrderRepository.create.mockReturnValue(createdWorkOrder);
      workOrderRepository.save.mockResolvedValue(createdWorkOrder);
  
      historyRepository.create.mockImplementation((value) => value);
      historyRepository.save.mockResolvedValue({
        id: 'history-id',
      });
  
      const result = await service.create(dto, createdBy);
  
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
  
      expect(workOrderRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: null,
        priority: WorkOrderPriority.MEDIUM,
        dueDate: null,
        createdBy,
        status: WorkOrderStatus.NEW,
        assignedTo: null,
      });
  
      expect(workOrderRepository.save).toHaveBeenCalledWith(
        createdWorkOrder,
      );
  
      expect(result).toEqual(createdWorkOrder);
    });
  
    it('should use the provided priority and convert dueDate to Date', async () => {
      const dto = {
        title: 'Urgent customer onboarding',
        priority: WorkOrderPriority.URGENT,
        dueDate: '2026-10-10T18:00:00.000Z',
      };
  
      const createdBy = 'admin-user-id';
  
      const createdWorkOrder = {
        id: 'work-order-id',
        title: dto.title,
      };
  
      workOrderRepository.create.mockReturnValue(createdWorkOrder);
      workOrderRepository.save.mockResolvedValue(createdWorkOrder);
  
      historyRepository.create.mockImplementation((value) => value);
      historyRepository.save.mockResolvedValue({
        id: 'history-id',
      });
  
      await service.create(dto, createdBy);
  
      expect(workOrderRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: null,
        priority: WorkOrderPriority.URGENT,
        dueDate: new Date(dto.dueDate),
        createdBy,
        status: WorkOrderStatus.NEW,
        assignedTo: null,
      });
    });
  
    it('should create the initial status history entry', async () => {
      const dto = {
        title: 'Prepare customer onboarding',
      };
  
      const createdBy = 'admin-user-id';
  
      const savedWorkOrder = {
        id: 'work-order-id',
        title: dto.title,
      };
  
      workOrderRepository.create.mockReturnValue(savedWorkOrder);
      workOrderRepository.save.mockResolvedValue(savedWorkOrder);
  
      historyRepository.create.mockImplementation((value) => value);
      historyRepository.save.mockResolvedValue({
        id: 'history-id',
      });
  
      await service.create(dto, createdBy);
  
      expect(historyRepository.create).toHaveBeenCalledWith({
        workOrderId: savedWorkOrder.id,
        fromStatus: null,
        toStatus: WorkOrderStatus.NEW,
        changedBy: createdBy,
        reason: 'Work order created',
      });
  
      expect(historyRepository.save).toHaveBeenCalledWith({
        workOrderId: savedWorkOrder.id,
        fromStatus: null,
        toStatus: WorkOrderStatus.NEW,
        changedBy: createdBy,
        reason: 'Work order created',
      });
    });
  
    it('should create the work order and history inside the same transaction', async () => {
      const dto = {
        title: 'Transactional work order',
      };
  
      const createdBy = 'admin-user-id';
  
      const savedWorkOrder = {
        id: 'work-order-id',
        title: dto.title,
      };
  
      workOrderRepository.create.mockReturnValue(savedWorkOrder);
      workOrderRepository.save.mockResolvedValue(savedWorkOrder);
  
      historyRepository.create.mockImplementation((value) => value);
      historyRepository.save.mockResolvedValue({
        id: 'history-id',
      });
  
      await service.create(dto, createdBy);
  
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(manager.getRepository).toHaveBeenCalledTimes(2);
  
      expect(workOrderRepository.save).toHaveBeenCalledTimes(1);
      expect(historyRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return all work orders for ADMIN', async () => {
        const workOrders = [
          { id: 'work-order-1' },
          { id: 'work-order-2' },
        ];
      
        workOrderRepository.find.mockResolvedValue(workOrders);
      
        const result = await service.findAll(
          'admin-user-id',
          UserRole.ADMIN,
        );
      
        expect(workOrderRepository.find).toHaveBeenCalledWith({
          where: {},
          order: {
            createdAt: 'DESC',
          },
        });
      
        expect(result).toEqual(workOrders);
      });
      
      it('should return only assigned work orders for OPERATOR', async () => {
        const workOrders = [
          {
            id: 'work-order-1',
            assignedTo: 'operator-user-id',
          },
        ];
      
        workOrderRepository.find.mockResolvedValue(workOrders);
      
        const result = await service.findAll(
          'operator-user-id',
          UserRole.OPERATOR,
        );
      
        expect(workOrderRepository.find).toHaveBeenCalledWith({
          where: {
            assignedTo: 'operator-user-id',
          },
          order: {
            createdAt: 'DESC',
          },
        });
      
        expect(result).toEqual(workOrders);
      });
      
      it('should return any work order requested by ADMIN', async () => {
        const workOrder = {
          id: 'work-order-id',
        };
      
        workOrderRepository.findOne.mockResolvedValue(workOrder);
      
        const result = await service.findOne(
          'work-order-id',
          'admin-user-id',
          UserRole.ADMIN,
        );
      
        expect(workOrderRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: 'work-order-id',
          },
        });
      
        expect(result).toEqual(workOrder);
      });
      
      it('should restrict OPERATOR to assigned work orders', async () => {
        workOrderRepository.findOne.mockResolvedValue(null);
      
        await expect(
          service.findOne(
            'work-order-id',
            'operator-user-id',
            UserRole.OPERATOR,
          ),
        ).rejects.toThrow('Work order not found');
      
        expect(workOrderRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: 'work-order-id',
            assignedTo: 'operator-user-id',
          },
        });
      });

      it('should assign a NEW work order to an operator', async () => {
        const workOrder = {
          id: 'work-order-id',
          title: 'Prepare customer onboarding',
          status: WorkOrderStatus.NEW,
          assignedTo: null,
        };
      
        const savedWorkOrder = {
          ...workOrder,
          status: WorkOrderStatus.ASSIGNED,
          assignedTo: 'operator-user-id',
        };
      
        workOrderRepository.findOne.mockResolvedValue(workOrder);
        workOrderRepository.save.mockResolvedValue(savedWorkOrder);
      
        historyRepository.create.mockImplementation((value) => value);
        historyRepository.save.mockResolvedValue({
          id: 'history-id',
        });
      
        const result = await service.assign(
          'work-order-id',
          'operator-user-id',
          'admin-user-id',
        );
      
        expect(workOrderRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: 'work-order-id',
          },
        });
      
        expect(workOrderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'work-order-id',
            status: WorkOrderStatus.ASSIGNED,
            assignedTo: 'operator-user-id',
          }),
        );
      
        expect(result).toEqual(savedWorkOrder);
      });

      it('should create NEW to ASSIGNED history when assigning', async () => {
        const workOrder = {
          id: 'work-order-id',
          status: WorkOrderStatus.NEW,
          assignedTo: null,
        };
      
        workOrderRepository.findOne.mockResolvedValue(workOrder);
        workOrderRepository.save.mockImplementation(
          async (value) => value,
        );
      
        historyRepository.create.mockImplementation((value) => value);
        historyRepository.save.mockImplementation(
          async (value) => value,
        );
      
        await service.assign(
          'work-order-id',
          'operator-user-id',
          'admin-user-id',
        );
      
        expect(historyRepository.create).toHaveBeenCalledWith({
          workOrderId: 'work-order-id',
          fromStatus: WorkOrderStatus.NEW,
          toStatus: WorkOrderStatus.ASSIGNED,
          changedBy: 'admin-user-id',
          reason: 'Work order assigned',
        });
      
        expect(historyRepository.save).toHaveBeenCalledWith({
          workOrderId: 'work-order-id',
          fromStatus: WorkOrderStatus.NEW,
          toStatus: WorkOrderStatus.ASSIGNED,
          changedBy: 'admin-user-id',
          reason: 'Work order assigned',
        });
      });

      it('should throw when assigning a work order that does not exist', async () => {
        workOrderRepository.findOne.mockResolvedValue(null);
      
        await expect(
          service.assign(
            'missing-work-order-id',
            'operator-user-id',
            'admin-user-id',
          ),
        ).rejects.toThrow('Work order not found');
      
        expect(workOrderRepository.save).not.toHaveBeenCalled();
        expect(historyRepository.save).not.toHaveBeenCalled();
      });

      it('should throw when assigning a work order that does not exist', async () => {
        workOrderRepository.findOne.mockResolvedValue(null);
      
        await expect(
          service.assign(
            'missing-work-order-id',
            'operator-user-id',
            'admin-user-id',
          ),
        ).rejects.toThrow('Work order not found');
      
        expect(workOrderRepository.save).not.toHaveBeenCalled();
        expect(historyRepository.save).not.toHaveBeenCalled();
      });

      it('should transition ASSIGNED to IN_PROGRESS with START', async () => {
        const workOrder = {
          id: 'work-order-id',
          status: WorkOrderStatus.ASSIGNED,
          assignedTo: 'operator-user-id',
        };
      
        workOrderRepository.findOne.mockResolvedValue(workOrder);
      
        workOrderRepository.save.mockImplementation(
          async (value) => value,
        );
      
        historyRepository.create.mockImplementation(
          (value) => value,
        );
      
        historyRepository.save.mockImplementation(
          async (value) => value,
        );
      
        const result = await service.transition(
          'work-order-id',
          WorkOrderAction.START,
          'operator-user-id',
          UserRole.OPERATOR,
        );
      
        expect(result.status).toBe(
          WorkOrderStatus.IN_PROGRESS,
        );
      
        expect(historyRepository.create).toHaveBeenCalledWith({
          workOrderId: 'work-order-id',
          fromStatus: WorkOrderStatus.ASSIGNED,
          toStatus: WorkOrderStatus.IN_PROGRESS,
          changedBy: 'operator-user-id',
          reason: 'Work order started',
        });
      });

      it('should transition IN_PROGRESS to IN_REVIEW', async () => {
        const workOrder = {
          id: 'work-order-id',
          status: WorkOrderStatus.IN_PROGRESS,
          assignedTo: 'operator-user-id',
        };
      
        workOrderRepository.findOne.mockResolvedValue(workOrder);
        workOrderRepository.save.mockImplementation(
          async (value) => value,
        );
        historyRepository.create.mockImplementation(
          (value) => value,
        );
        historyRepository.save.mockImplementation(
          async (value) => value,
        );
      
        const result = await service.transition(
          'work-order-id',
          WorkOrderAction.SUBMIT_FOR_REVIEW,
          'operator-user-id',
          UserRole.OPERATOR,
        );
      
        expect(result.status).toBe(
          WorkOrderStatus.IN_REVIEW,
        );
      
        expect(historyRepository.create).toHaveBeenCalledWith({
          workOrderId: 'work-order-id',
          fromStatus: WorkOrderStatus.IN_PROGRESS,
          toStatus: WorkOrderStatus.IN_REVIEW,
          changedBy: 'operator-user-id',
          reason: 'Work order submitted for review',
        });
      });

      it('should transition IN_REVIEW to IN_PROGRESS when ADMIN requests changes', async () => {
        const workOrder = {
          id: 'work-order-id',
          status: WorkOrderStatus.IN_REVIEW,
          assignedTo: 'operator-user-id',
        };
      
        workOrderRepository.findOne.mockResolvedValue(workOrder);
        workOrderRepository.save.mockImplementation(
          async (value) => value,
        );
        historyRepository.create.mockImplementation(
          (value) => value,
        );
        historyRepository.save.mockImplementation(
          async (value) => value,
        );
      
        const result = await service.transition(
          'work-order-id',
          WorkOrderAction.REQUEST_CHANGES,
          'admin-user-id',
          UserRole.ADMIN,
          'Customer documentation is incomplete',
        );
      
        expect(result.status).toBe(
          WorkOrderStatus.IN_PROGRESS,
        );
      
        expect(historyRepository.create).toHaveBeenCalledWith({
          workOrderId: 'work-order-id',
          fromStatus: WorkOrderStatus.IN_REVIEW,
          toStatus: WorkOrderStatus.IN_PROGRESS,
          changedBy: 'admin-user-id',
          reason: 'Customer documentation is incomplete',
        });
      });

      it('should transition IN_REVIEW to IN_PROGRESS when ADMIN requests changes', async () => {
  const workOrder = {
    id: 'work-order-id',
    status: WorkOrderStatus.IN_REVIEW,
    assignedTo: 'operator-user-id',
  };

  workOrderRepository.findOne.mockResolvedValue(workOrder);
  workOrderRepository.save.mockImplementation(
    async (value) => value,
  );
  historyRepository.create.mockImplementation(
    (value) => value,
  );
  historyRepository.save.mockImplementation(
    async (value) => value,
  );

  const result = await service.transition(
    'work-order-id',
    WorkOrderAction.REQUEST_CHANGES,
    'admin-user-id',
    UserRole.ADMIN,
    'Customer documentation is incomplete',
  );

  expect(result.status).toBe(
    WorkOrderStatus.IN_PROGRESS,
  );

  expect(historyRepository.create).toHaveBeenCalledWith({
    workOrderId: 'work-order-id',
    fromStatus: WorkOrderStatus.IN_REVIEW,
    toStatus: WorkOrderStatus.IN_PROGRESS,
    changedBy: 'admin-user-id',
    reason: 'Customer documentation is incomplete',
  });
});

it('should require a reason when requesting changes', async () => {
    workOrderRepository.findOne.mockResolvedValue({
      id: 'work-order-id',
      status: WorkOrderStatus.IN_REVIEW,
      assignedTo: 'operator-user-id',
    });
  
    await expect(
      service.transition(
        'work-order-id',
        WorkOrderAction.REQUEST_CHANGES,
        'admin-user-id',
        UserRole.ADMIN,
      ),
    ).rejects.toThrow(
      'Reason is required for this transition',
    );
  
    expect(workOrderRepository.save).not.toHaveBeenCalled();
    expect(historyRepository.save).not.toHaveBeenCalled();
  });

  it('should reject an empty reason when requesting changes', async () => {
    workOrderRepository.findOne.mockResolvedValue({
      id: 'work-order-id',
      status: WorkOrderStatus.IN_REVIEW,
      assignedTo: 'operator-user-id',
    });
  
    await expect(
      service.transition(
        'work-order-id',
        WorkOrderAction.REQUEST_CHANGES,
        'admin-user-id',
        UserRole.ADMIN,
        '   ',
      ),
    ).rejects.toThrow(
      'Reason is required for this transition',
    );
  });

  it('should transition IN_REVIEW to COMPLETED when ADMIN approves', async () => {
    const workOrder = {
      id: 'work-order-id',
      status: WorkOrderStatus.IN_REVIEW,
      assignedTo: 'operator-user-id',
    };
  
    workOrderRepository.findOne.mockResolvedValue(workOrder);
    workOrderRepository.save.mockImplementation(
      async (value) => value,
    );
    historyRepository.create.mockImplementation(
      (value) => value,
    );
    historyRepository.save.mockImplementation(
      async (value) => value,
    );
  
    const result = await service.transition(
      'work-order-id',
      WorkOrderAction.APPROVE,
      'admin-user-id',
      UserRole.ADMIN,
    );
  
    expect(result.status).toBe(
      WorkOrderStatus.COMPLETED,
    );
  
    expect(historyRepository.create).toHaveBeenCalledWith({
      workOrderId: 'work-order-id',
      fromStatus: WorkOrderStatus.IN_REVIEW,
      toStatus: WorkOrderStatus.COMPLETED,
      changedBy: 'admin-user-id',
      reason: 'Work order approved',
    });
  });

  it('should reject a transition when actor role is not allowed', async () => {
    await expect(
      service.transition(
        'work-order-id',
        WorkOrderAction.APPROVE,
        'operator-user-id',
        UserRole.OPERATOR,
      ),
    ).rejects.toThrow(
      'You do not have permission to perform this transition',
    );
  
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('should reject an operator transition for another operator work order', async () => {
    workOrderRepository.findOne.mockResolvedValue({
      id: 'work-order-id',
      status: WorkOrderStatus.ASSIGNED,
      assignedTo: 'another-operator-id',
    });
  
    await expect(
      service.transition(
        'work-order-id',
        WorkOrderAction.START,
        'operator-user-id',
        UserRole.OPERATOR,
      ),
    ).rejects.toThrow('Work order not found');
  
    expect(workOrderRepository.save).not.toHaveBeenCalled();
    expect(historyRepository.save).not.toHaveBeenCalled();
  });

  it('should reject an action from an invalid status', async () => {
    workOrderRepository.findOne.mockResolvedValue({
      id: 'work-order-id',
      status: WorkOrderStatus.NEW,
      assignedTo: 'operator-user-id',
    });
  
    await expect(
      service.transition(
        'work-order-id',
        WorkOrderAction.START,
        'operator-user-id',
        UserRole.OPERATOR,
      ),
    ).rejects.toThrow(
      'Action START is not allowed from status NEW',
    );
  
    expect(workOrderRepository.save).not.toHaveBeenCalled();
    expect(historyRepository.save).not.toHaveBeenCalled();
  });

  it('should reject a transition for a work order that does not exist', async () => {
    workOrderRepository.findOne.mockResolvedValue(null);
  
    await expect(
      service.transition(
        'missing-work-order-id',
        WorkOrderAction.START,
        'operator-user-id',
        UserRole.OPERATOR,
      ),
    ).rejects.toThrow('Work order not found');
  
    expect(workOrderRepository.save).not.toHaveBeenCalled();
    expect(historyRepository.save).not.toHaveBeenCalled();
  });

  it('should return work order history for ADMIN', async () => {
    const workOrder = {
      id: 'work-order-id',
      createdBy: 'admin-user-id',
      assignedTo: 'operator-user-id',
    };
  
    const history = [
      {
        id: 'history-1',
        workOrderId: 'work-order-id',
        fromStatus: null,
        toStatus: WorkOrderStatus.NEW,
        changedBy: 'admin-user-id',
        reason: 'Work order created',
      },
      {
        id: 'history-2',
        workOrderId: 'work-order-id',
        fromStatus: WorkOrderStatus.NEW,
        toStatus: WorkOrderStatus.ASSIGNED,
        changedBy: 'admin-user-id',
        reason: 'Work order assigned',
      },
    ];
  
    workOrderRepository.findOne.mockResolvedValue(
      workOrder,
    );
  
    historyRepository.find.mockResolvedValue(history);
  
    const result = await service.findHistory(
      'work-order-id',
      'admin-user-id',
      UserRole.ADMIN,
    );
  
    expect(result).toEqual(history);
  
    expect(workOrderRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'work-order-id',
      },
    });
  
    expect(historyRepository.find).toHaveBeenCalledWith({
        where: {
          workOrderId: 'work-order-id',
        },
        relations: {
          changedByProfile: true,
        },
        order: {
          createdAt: 'ASC',
        },
      });
  });

  it('should return history for the assigned OPERATOR', async () => {
    const workOrder = {
      id: 'work-order-id',
      assignedTo: 'operator-user-id',
    };
  
    const history = [
      {
        id: 'history-1',
        workOrderId: 'work-order-id',
        fromStatus: WorkOrderStatus.ASSIGNED,
        toStatus: WorkOrderStatus.IN_PROGRESS,
        changedBy: 'operator-user-id',
        reason: 'Work order started',
      },
    ];
  
    workOrderRepository.findOne.mockResolvedValue(
      workOrder,
    );
  
    historyRepository.find.mockResolvedValue(history);
  
    const result = await service.findHistory(
      'work-order-id',
      'operator-user-id',
      UserRole.OPERATOR,
    );
  
    expect(result).toEqual(history);
  
    expect(workOrderRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'work-order-id',
        assignedTo: 'operator-user-id',
      },
    });
  
    expect(historyRepository.find).toHaveBeenCalledWith({
        where: {
          workOrderId: 'work-order-id',
        },
        relations: {
          changedByProfile: true,
        },
        order: {
          createdAt: 'ASC',
        },
      });
  });

  it('should not return history for a work order not assigned to the OPERATOR', async () => {
    workOrderRepository.findOne.mockResolvedValue(null);
  
    await expect(
      service.findHistory(
        'work-order-id',
        'operator-user-id',
        UserRole.OPERATOR,
      ),
    ).rejects.toThrow('Work order not found');
  
    expect(historyRepository.find).not.toHaveBeenCalled();
  });

  it('should update work order metadata', async () => {
    const workOrder = {
      id: 'work-order-id',
      title: 'Old title',
      description: 'Old description',
      priority: WorkOrderPriority.LOW,
      dueDate: null,
      status: WorkOrderStatus.NEW,
    };
  
    workOrderRepository.findOne.mockResolvedValue(
      workOrder,
    );
  
    workOrderRepository.save.mockImplementation(
      async (value) => value,
    );
  
    const result = await service.update(
      'work-order-id',
      {
        title: 'Updated title',
        description: 'Updated description',
        priority: WorkOrderPriority.HIGH,
        dueDate: '2026-10-20T18:00:00.000Z',
      },
    );
  
    expect(result.title).toBe('Updated title');
    expect(result.description).toBe(
      'Updated description',
    );
    expect(result.priority).toBe(
      WorkOrderPriority.HIGH,
    );
  
    expect(result.dueDate).toEqual(
      new Date('2026-10-20T18:00:00.000Z'),
    );
  
    expect(result.status).toBe(
      WorkOrderStatus.NEW,
    );
  
    expect(workOrderRepository.save).toHaveBeenCalledWith(
      workOrder,
    );
  });

  it('should partially update a work order', async () => {
    const workOrder = {
      id: 'work-order-id',
      title: 'Original title',
      description: 'Original description',
      priority: WorkOrderPriority.LOW,
      dueDate: null,
      status: WorkOrderStatus.NEW,
    };
  
    workOrderRepository.findOne.mockResolvedValue(
      workOrder,
    );
  
    workOrderRepository.save.mockImplementation(
      async (value) => value,
    );
  
    const result = await service.update(
      'work-order-id',
      {
        priority: WorkOrderPriority.URGENT,
      },
    );
  
    expect(result.title).toBe('Original title');
  
    expect(result.description).toBe(
      'Original description',
    );
  
    expect(result.priority).toBe(
      WorkOrderPriority.URGENT,
    );
  
    expect(result.status).toBe(
      WorkOrderStatus.NEW,
    );
  });

  it('should trim updated text fields', async () => {
    const workOrder = {
      id: 'work-order-id',
      title: 'Original title',
      description: 'Original description',
      priority: WorkOrderPriority.MEDIUM,
      dueDate: null,
    };
  
    workOrderRepository.findOne.mockResolvedValue(
      workOrder,
    );
  
    workOrderRepository.save.mockImplementation(
      async (value) => value,
    );
  
    const result = await service.update(
      'work-order-id',
      {
        title: '  Updated title  ',
        description: '  Updated description  ',
      },
    );
  
    expect(result.title).toBe('Updated title');
  
    expect(result.description).toBe(
      'Updated description',
    );
  });

  it('should throw when updating a work order that does not exist', async () => {
    workOrderRepository.findOne.mockResolvedValue(null);
  
    await expect(
      service.update(
        'work-order-id',
        {
          title: 'Updated title',
        },
      ),
    ).rejects.toThrow('Work order not found');
  
    expect(workOrderRepository.save).not.toHaveBeenCalled();
  });

  it('should reject an empty title after trimming', async () => {
    workOrderRepository.findOne.mockResolvedValue({
      id: 'work-order-id',
      title: 'Original title',
      priority: WorkOrderPriority.MEDIUM,
    });
  
    await expect(
      service.update(
        'work-order-id',
        {
          title: '   ',
        },
      ),
    ).rejects.toThrow('Title cannot be empty');
  
    expect(workOrderRepository.save).not.toHaveBeenCalled();
  });
  });
import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { WorkOrdersService } from './work-orders.service.js';
import { UserRole } from '@flowops/shared';
import { ProfilesService } from '../profiles/profiles.service.js';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto.js';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto.js';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto.js';
import { ListWorkOrdersQueryDto } from './dto/list-work-orders-query.dto.js';

@Controller('work-orders')
@UseGuards(AuthGuard, RolesGuard)
export class WorkOrdersController {
  constructor(
    private readonly workOrdersService: WorkOrdersService,
    private readonly profilesService: ProfilesService
) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateWorkOrderDto, @CurrentUser() user: User) {
    return this.workOrdersService.create(dto, user.id);
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query() query: ListWorkOrdersQueryDto,
  ) {
    const profile = await this.profilesService.findById(user.id);

    return this.workOrdersService.findAll(
      user.id,
      profile.role,
      query,
    );
  }

@Get(':id/history')
async findHistory(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() user: User,
) {
  const profile = await this.profilesService.findById(
    user.id,
  );

  return this.workOrdersService.findHistory(
    id,
    user.id,
    profile.role,
  );
}

@Get(':id')
async findOne(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() user: User,
) {
  const profile = await this.profilesService.findById(user.id);

  return this.workOrdersService.findOne(
    id,
    user.id,
    profile.role,
  );
}

@Post(':id/assign')
@Roles(UserRole.ADMIN)
async assign(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: AssignWorkOrderDto,
  @CurrentUser() user: User,
) {
  const operator = await this.profilesService.findById(
    dto.operatorId,
  );

  if (operator.role !== UserRole.OPERATOR) {
    throw new BadRequestException(
      'Work orders can only be assigned to operators',
    );
  }

  return this.workOrdersService.assign(
    id,
    operator.id,
    user.id,
  );
}

@Post(':id/transitions')
async transition(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: TransitionWorkOrderDto,
  @CurrentUser() user: User,
) {
  const profile = await this.profilesService.findById(
    user.id,
  );

  return this.workOrdersService.transition(
    id,
    dto.action,
    user.id,
    profile.role,
    dto.reason,
  );
}

@Patch(':id')
@Roles(UserRole.ADMIN)
update(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: UpdateWorkOrderDto,
) {
  return this.workOrdersService.update(id, dto);
}
}

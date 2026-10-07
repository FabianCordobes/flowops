import { UserRole } from '@flowops/shared';
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ProfilesService } from './profiles.service.js';

@Controller('profiles')
@UseGuards(AuthGuard, RolesGuard)
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
  ) {}

  @Get('operators')
  @Roles(UserRole.ADMIN)
  findOperators() {
    return this.profilesService.findOperators();
  }
}
import { UserRole } from '@flowops/shared';
import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ProfilesService } from './profiles.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { User } from '@supabase/supabase-js';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto.js';

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

  @Patch('me')
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateMyProfileDto,
  ) {
    const profile = await this.profilesService.updateMyProfile(
      user.id,
      dto.fullName,
    );

    return {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
    };
  }
}
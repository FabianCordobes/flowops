import { Module } from '@nestjs/common';

import { AuthGuard } from './guards/auth.guard.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { AuthController } from './auth.controller.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports: [ProfilesModule],
  controllers: [AuthController],
  providers: [AuthGuard, RolesGuard],
  exports: [AuthGuard, RolesGuard],
})
export class AuthModule {}

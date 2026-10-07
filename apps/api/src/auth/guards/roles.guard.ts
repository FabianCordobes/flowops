import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@flowops/shared';
import { Profile } from '../../profiles/entities/profile.entity.js';
import { ProfilesService } from '../../profiles/profiles.service.js';
import { AuthenticatedRequest } from './auth.guard.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

export interface AuthorizedRequest extends AuthenticatedRequest {
  profile?: Profile;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly profilesService: ProfilesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthorizedRequest>();

    if (!request.user) {
      throw new ForbiddenException('Authenticated user not found');
    }

    const profile = await this.profilesService.findById(request.user.id);

    request.profile = profile;

    if (!requiredRoles.includes(profile.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}

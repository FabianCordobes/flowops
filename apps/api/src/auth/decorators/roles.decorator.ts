import { SetMetadata } from '@nestjs/common';

import { UserRole } from '../../profiles/entities/profile.entity.js';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

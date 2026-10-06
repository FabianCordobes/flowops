import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Profile, UserRole } from '../../profiles/entities/profile.entity.js';
import { ProfilesService } from '../../profiles/profiles.service.js';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const getAllAndOverride = vi.fn();
  const findById = vi.fn();

  const reflector = {
    getAllAndOverride,
  };

  const profilesService = {
    findById,
  };

  const createContext = (user?: User): ExecutionContext => {
    const request = {
      user,
    };

    return {
      getHandler: () => vi.fn(),
      getClass: () => class TestController {},
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  const createProfile = (role: UserRole): Profile => ({
    id: '4c20e4a7-0de9-45b4-9f15-e7afb1eae0e9',
    fullName: 'Fabian Cordobes',
    email: 'admin@flowops.local',
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const user = {
    id: '4c20e4a7-0de9-45b4-9f15-e7afb1eae0e9',
    email: 'admin@flowops.local',
  } as User;

  beforeEach(() => {
    vi.clearAllMocks();

    guard = new RolesGuard(
      reflector as unknown as Reflector,
      profilesService as unknown as ProfilesService,
    );
  });

  it('should allow access when no roles are required', async () => {
    getAllAndOverride.mockReturnValue(undefined);

    const result = await guard.canActivate(createContext(user));

    expect(result).toBe(true);
    expect(findById).not.toHaveBeenCalled();
  });

  it('should allow ADMIN when ADMIN role is required', async () => {
    getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    findById.mockResolvedValue(createProfile(UserRole.ADMIN));

    const result = await guard.canActivate(createContext(user));

    expect(result).toBe(true);

    expect(findById).toHaveBeenCalledWith(user.id);
  });

  it('should reject OPERATOR when ADMIN role is required', async () => {
    getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    findById.mockResolvedValue(createProfile(UserRole.OPERATOR));

    await expect(guard.canActivate(createContext(user))).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(findById).toHaveBeenCalledWith(user.id);
  });

  it('should reject access when authenticated user is missing', async () => {
    getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    await expect(guard.canActivate(createContext())).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(findById).not.toHaveBeenCalled();
  });
});

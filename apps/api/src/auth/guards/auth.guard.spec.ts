import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SupabaseService } from '../../supabase/supabase.service.js';
import { AuthGuard } from './auth.guard.js';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const getUser = vi.fn();

  const supabaseService = {
    client: {
      auth: {
        getUser,
      },
    },
  };

  const createContext = (authorization?: string): ExecutionContext => {
    const request = {
      headers: {
        authorization,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    guard = new AuthGuard(supabaseService as unknown as SupabaseService);
  });

  it('should throw UnauthorizedException when authorization header is missing', async () => {
    const context = createContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(getUser).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when authorization header is malformed', async () => {
    const context = createContext('InvalidToken');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(getUser).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when access token is invalid', async () => {
    getUser.mockResolvedValue({
      data: {
        user: null,
      },
      error: {
        message: 'Invalid JWT',
      },
    });

    const context = createContext('Bearer invalid-token');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(getUser).toHaveBeenCalledWith('invalid-token');
  });

  it('should authenticate a valid access token', async () => {
    const user = {
      id: '4c20e4a7-0de9-45b4-9f15-e7afb1eae0e9',
      email: 'admin@flowops.local',
    } as User;

    getUser.mockResolvedValue({
      data: {
        user,
      },
      error: null,
    });

    const request = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(getUser).toHaveBeenCalledWith('valid-token');

    expect(request).toHaveProperty('user', user);
  });
});

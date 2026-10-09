import { apiRequest } from '../lib/api';
import type { Profile } from '../types/auth';

export const getCurrentProfile = (): Promise<Profile> => {
  return apiRequest<Profile>('/me');
};

export const updateMyProfile = (
  fullName: string,
): Promise<Profile> => {
  return apiRequest<Profile>('/profiles/me', {
    method: 'PATCH',
    body: JSON.stringify({ fullName }),
  });
};
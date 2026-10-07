import { apiRequest } from '../lib/api';
import type { Profile } from '../types/auth';

export const getCurrentProfile = (): Promise<Profile> => {
  return apiRequest<Profile>('/me');
};
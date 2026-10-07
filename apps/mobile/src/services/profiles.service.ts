import { apiRequest } from '../lib/api';
import type { Profile } from '../types/auth';

export const getOperators = (): Promise<Profile[]> => {
  return apiRequest<Profile[]>('/profiles/operators');
};
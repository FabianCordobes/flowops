export type UserRole = 'ADMIN' | 'OPERATOR';

export type Profile = {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
};
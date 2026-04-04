export type UserRole = 'owner' | 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: Pick<User, 'id' | 'email' | 'role'>;
  perusahaanId?: string;
  accessToken: string;
  refreshToken: string;
}

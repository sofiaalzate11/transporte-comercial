export type UserRole = 'DRIVER' | 'FLEET_MANAGER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  vehiclePlate?: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  user: AuthUser;
  expiresAt: number; // Unix timestamp en milisegundos
}

export interface OtpChallenge {
  email: string;
  expiresAt: number; // Unix timestamp en milisegundos
  attemptsRemaining: number;
  cooldownSeconds: number;
}

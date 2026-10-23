import { AuthUser, AuthSession, OtpChallenge } from '../models/AuthUser';

export interface RegisterParams {
  email: string;
  fullName: string;
  vehiclePlate?: string;
  password?: string;
}

export interface IAuthRepository {
  register(params: RegisterParams): Promise<{ user: AuthUser; challenge: OtpChallenge }>;
  login(email: string): Promise<{ user: AuthUser; challenge: OtpChallenge }>;
  verifyEmailOtp(email: string, code: string): Promise<AuthSession>;
  resendOtp(email: string): Promise<OtpChallenge>;
  getCurrentSession(): Promise<AuthSession | null>;
  logout(): Promise<void>;
}

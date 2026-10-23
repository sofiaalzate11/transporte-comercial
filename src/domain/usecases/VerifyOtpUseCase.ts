import { IAuthRepository } from '../repositories/IAuthRepository';
import { AuthSession } from '../models/AuthUser';

export class VerifyOtpUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  public async execute(email: string, code: string): Promise<AuthSession> {
    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      throw new Error('El código de verificación debe contener exactamente 6 dígitos numéricos');
    }
    return this.authRepo.verifyEmailOtp(email.trim(), trimmedCode);
  }
}

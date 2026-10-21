import { IAuthRepository } from '../repositories/IAuthRepository';
import { AuthUser, OtpChallenge } from '../models/AuthUser';

export class LoginUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  public async execute(email: string): Promise<{ user: AuthUser; challenge: OtpChallenge }> {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      throw new Error('Ingrese un correo electrónico válido');
    }
    return this.authRepo.login(trimmed);
  }
}

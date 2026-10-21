import { IAuthRepository, RegisterParams } from '../repositories/IAuthRepository';
import { AuthUser, OtpChallenge } from '../models/AuthUser';

export class RegisterUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  public async execute(params: RegisterParams): Promise<{ user: AuthUser; challenge: OtpChallenge }> {
    if (!params.email || !params.email.includes('@')) {
      throw new Error('Debe proporcionar un correo electrónico válido');
    }
    if (!params.fullName || params.fullName.trim().length < 3) {
      throw new Error('El nombre completo debe tener al menos 3 caracteres');
    }
    return this.authRepo.register(params);
  }
}

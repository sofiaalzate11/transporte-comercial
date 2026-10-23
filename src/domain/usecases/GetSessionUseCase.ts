import { IAuthRepository } from '../repositories/IAuthRepository';
import { AuthSession } from '../models/AuthUser';

export class GetSessionUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  public async execute(): Promise<AuthSession | null> {
    return this.authRepo.getCurrentSession();
  }
}

import { TollStation } from '../models/TollStation';
import { ITollStationRepository } from '../repositories/ITollStationRepository';

export class GetTollStationsUseCase {
  constructor(private readonly repository: ITollStationRepository) {}

  async execute(forceSync: boolean = false, department?: string): Promise<TollStation[]> {
    if (forceSync) {
      await this.repository.syncTollsFromRemote();
    }
    if (department && department.trim().length > 0) {
      return this.repository.getTollsByDepartment(department.trim());
    }
    return this.repository.getAllTolls();
  }
}

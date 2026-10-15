import { RoadAlert } from '../models/RoadAlert';
import { IRoadAlertRepository } from '../repositories/IRoadAlertRepository';

export class GetRoadAlertsUseCase {
  constructor(private readonly repository: IRoadAlertRepository) {}

  async execute(forceSync: boolean = false): Promise<RoadAlert[]> {
    if (forceSync) {
      await this.repository.syncAlertsFromRemote();
    }
    return this.repository.getActiveAlerts();
  }
}

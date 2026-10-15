import { IRoadAlertRepository } from '../../domain/repositories/IRoadAlertRepository';
import { RoadAlert } from '../../domain/models/RoadAlert';
import { RoadAlertDao } from '../datasources/local/RoadAlertDao';
import { InviasArcGisClient } from '../datasources/remote/InviasArcGisClient';
import { RoadAlertMapper } from '../mappers/RoadAlertMapper';

export class RoadAlertRepositoryImpl implements IRoadAlertRepository {
  constructor(
    private readonly localDao: RoadAlertDao = new RoadAlertDao(),
    private readonly remoteClient: InviasArcGisClient = new InviasArcGisClient()
  ) {}

  public async getActiveAlerts(): Promise<RoadAlert[]> {
    const cached = this.localDao.getActiveAlerts();
    if (cached.length === 0) {
      await this.syncAlertsFromRemote();
      return this.localDao.getActiveAlerts();
    }
    return cached;
  }

  public async syncAlertsFromRemote(): Promise<number> {
    const rawFeatures = await this.remoteClient.fetchAlerts();
    const domainAlerts = rawFeatures.map(RoadAlertMapper.fromFeature);
    this.localDao.upsertBatch(domainAlerts);
    return domainAlerts.length;
  }

  public async getAlertById(id: string): Promise<RoadAlert | null> {
    return this.localDao.getById(id);
  }
}

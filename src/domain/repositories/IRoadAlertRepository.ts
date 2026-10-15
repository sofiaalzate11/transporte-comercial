import { RoadAlert } from '../models/RoadAlert';

export interface IRoadAlertRepository {
  getActiveAlerts(): Promise<RoadAlert[]>;
  syncAlertsFromRemote(): Promise<number>;
  getAlertById(id: string): Promise<RoadAlert | null>;
}

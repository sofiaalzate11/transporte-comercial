import { DatabaseManager } from './DatabaseManager';
import { RoadAlert } from '../../../domain/models/RoadAlert';

interface RoadAlertRow {
  id: string;
  department: string;
  road_name: string;
  sector: string;
  alert_type: string;
  severity: string;
  description: string;
  latitude: number;
  longitude: number;
  reported_at: string;
  updated_at: string;
  is_resolved: number;
}

export class RoadAlertDao {
  private db = DatabaseManager.getDatabase();

  public getActiveAlerts(): RoadAlert[] {
    const rows = this.db.getAllSync<RoadAlertRow>(
      'SELECT * FROM road_alerts WHERE is_resolved = 0 ORDER BY reported_at DESC;'
    );

    return rows.map((row) => ({
      id: row.id,
      department: row.department,
      roadName: row.road_name,
      sector: row.sector,
      alertType: row.alert_type as RoadAlert['alertType'],
      severity: row.severity as RoadAlert['severity'],
      description: row.description,
      latitude: row.latitude,
      longitude: row.longitude,
      reportedAt: row.reported_at,
      updatedAt: row.updated_at,
      isResolved: Boolean(row.is_resolved),
    }));
  }

  public getById(id: string): RoadAlert | null {
    const row = this.db.getFirstSync<RoadAlertRow>(
      'SELECT * FROM road_alerts WHERE id = ?;',
      [id]
    );

    if (!row) return null;

    return {
      id: row.id,
      department: row.department,
      roadName: row.road_name,
      sector: row.sector,
      alertType: row.alert_type as RoadAlert['alertType'],
      severity: row.severity as RoadAlert['severity'],
      description: row.description,
      latitude: row.latitude,
      longitude: row.longitude,
      reportedAt: row.reported_at,
      updatedAt: row.updated_at,
      isResolved: Boolean(row.is_resolved),
    };
  }

  public upsertBatch(alerts: RoadAlert[]): void {
    if (alerts.length === 0) return;

    this.db.withTransactionSync(() => {
      const statement = this.db.prepareSync(`
        INSERT INTO road_alerts (
          id, department, road_name, sector, alert_type, severity,
          description, latitude, longitude, reported_at, updated_at, is_resolved
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          department = excluded.department,
          road_name = excluded.road_name,
          sector = excluded.sector,
          alert_type = excluded.alert_type,
          severity = excluded.severity,
          description = excluded.description,
          latitude = excluded.latitude,
          longitude = excluded.longitude,
          reported_at = excluded.reported_at,
          updated_at = excluded.updated_at,
          is_resolved = excluded.is_resolved;
      `);

      try {
        for (const alert of alerts) {
          statement.executeSync([
            alert.id,
            alert.department,
            alert.roadName,
            alert.sector,
            alert.alertType,
            alert.severity,
            alert.description,
            alert.latitude,
            alert.longitude,
            alert.reportedAt,
            alert.updatedAt,
            alert.isResolved ? 1 : 0,
          ]);
        }
      } finally {
        statement.finalizeSync();
      }
    });
  }
}

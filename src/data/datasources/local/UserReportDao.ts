
import { DatabaseManager } from './DatabaseManager';
import {
  UserReport,
  UserIncidentType,
} from '../../../domain/models/UserReport';

interface UserReportRow {
  id: string;
  road_name: string;
  kilometer: number;
  description: string;
  incident_type: string;
  created_at: string;
}

export class UserReportDao {
  private db = DatabaseManager.getDatabase();

  public insertReport(report: UserReport): void {
    const stmt = this.db.prepareSync(`
      INSERT INTO user_reports (
        id, road_name, kilometer, description,
        incident_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?);
    `);

    try {
      stmt.executeSync([
        report.id,
        report.roadName,
        report.kilometer,
        report.description,
        report.incidentType,
        report.createdAt,
      ]);
    } finally {
      stmt.finalizeSync();
    }
  }

  public getAll(): UserReport[] {
    const rows = this.db.getAllSync<UserReportRow>(
      'SELECT * FROM user_reports ORDER BY created_at DESC;'
    );

    return rows.map((r) => ({
      id: r.id,
      roadName: r.road_name,
      kilometer: r.kilometer,
      description: r.description,
      incidentType: r.incident_type as UserIncidentType,
      createdAt: r.created_at,
    }));
  }

  public deleteById(id: string): void {
    const stmt = this.db.prepareSync(
      'DELETE FROM user_reports WHERE id = ?;'
    );

    try {
      stmt.executeSync([id]);
    } finally {
      stmt.finalizeSync();
    }
  }
}

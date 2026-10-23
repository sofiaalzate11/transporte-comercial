import * as SQLite from 'expo-sqlite';

export class DatabaseManager {
  private static instance: SQLite.SQLiteDatabase | null = null;
  private static readonly DB_NAME = 'transporte_colombia.db';

  public static getDatabase(): SQLite.SQLiteDatabase {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = SQLite.openDatabaseSync(DatabaseManager.DB_NAME);
      DatabaseManager.initSchema(DatabaseManager.instance);
    }
    return DatabaseManager.instance;
  }

  private static initSchema(db: SQLite.SQLiteDatabase): void {
    db.execSync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS road_alerts (
        id TEXT PRIMARY KEY NOT NULL,
        department TEXT NOT NULL,
        road_name TEXT NOT NULL,
        sector TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        reported_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_resolved INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_road_alerts_resolved ON road_alerts(is_resolved);
      CREATE INDEX IF NOT EXISTS idx_road_alerts_dept ON road_alerts(department);

      CREATE TABLE IF NOT EXISTS toll_stations (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        road_sector TEXT NOT NULL,
        concessionaire TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        rates_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

<<<<<<< HEAD
      
      -- [Isabella: REPORTES]
=======
      CREATE INDEX IF NOT EXISTS idx_toll_stations_dept ON toll_stations(department);

>>>>>>> origin/main
      CREATE TABLE IF NOT EXISTS user_reports (
        id TEXT PRIMARY KEY NOT NULL,
        road_name TEXT NOT NULL,
        kilometer REAL NOT NULL,
        description TEXT NOT NULL,
        incident_type TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

<<<<<<< HEAD
      CREATE INDEX IF NOT EXISTS idx_user_reports_date
      ON user_reports(created_at);


      
=======
      CREATE INDEX IF NOT EXISTS idx_user_reports_date ON user_reports(created_at);
>>>>>>> origin/main
    `);

    
    
  }
  
}

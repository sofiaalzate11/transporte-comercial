import * as SQLite from 'expo-sqlite';
import { RouteModel, RouteSegmentModel } from '../../domain/entities/route.model';
import { IncidentModel } from '../../domain/entities/incident.model';

export class SQLiteDataSource {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    this.db = await SQLite.openDatabaseAsync('transporte_colombia.db');

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS rutas (
        id TEXT PRIMARY KEY NOT NULL,
        usuario_id TEXT NOT NULL,
        codigo_manifiesto TEXT,
        origen_nombre TEXT NOT NULL,
        origen_lat REAL NOT NULL,
        origen_lon REAL NOT NULL,
        destino_nombre TEXT NOT NULL,
        destino_lat REAL NOT NULL,
        destino_lon REAL NOT NULL,
        eta_pactado TEXT NOT NULL,
        eta_recalculado TEXT,
        distancia_total_km REAL NOT NULL,
        tiempo_estimado_base_min INTEGER NOT NULL,
        estado TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tramos (
        id TEXT PRIMARY KEY NOT NULL,
        ruta_id TEXT NOT NULL,
        orden_secuencia INTEGER NOT NULL,
        origen_lat REAL NOT NULL,
        origen_lon REAL NOT NULL,
        destino_lat REAL NOT NULL,
        destino_lon REAL NOT NULL,
        via_codigo TEXT,
        distancia_km REAL NOT NULL,
        tiempo_base_min INTEGER NOT NULL,
        FOREIGN KEY (ruta_id) REFERENCES rutas (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS incidentes (
        id TEXT PRIMARY KEY NOT NULL,
        id_fuente_externa TEXT,
        tipo_evento TEXT NOT NULL,
        gravedad TEXT NOT NULL,
        descripcion TEXT,
        via_codigo TEXT,
        latitud REAL NOT NULL,
        longitud REAL NOT NULL,
        radio_afectacion_km REAL NOT NULL,
        retraso_estimado_min INTEGER NOT NULL,
        fuente TEXT NOT NULL,
        estado TEXT NOT NULL,
        fecha_reporte TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS telemetria_buffer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ruta_id TEXT NOT NULL,
        latitud REAL NOT NULL,
        longitud REAL NOT NULL,
        velocidad_kmh REAL,
        altitud REAL,
        bateria_nivel REAL,
        timestamp_captura TEXT NOT NULL,
        sincronizado INTEGER DEFAULT 0
      );
    `);
  }

  async saveRoutes(routes: RouteModel[]): Promise<void> {
    await this.init();
    if (!this.db) return;

    for (const r of routes) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO rutas 
         (id, usuario_id, codigo_manifiesto, origen_nombre, origen_lat, origen_lon, destino_nombre, destino_lat, destino_lon, eta_pactado, eta_recalculado, distancia_total_km, tiempo_estimado_base_min, estado) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.usuarioId,
          r.codigoManifiesto || null,
          r.origenNombre,
          r.origenLat,
          r.origenLon,
          r.destinoNombre,
          r.destinoLat,
          r.destinoLon,
          r.etaPactado,
          r.etaRecalculado || null,
          r.distanciaTotalKm,
          r.tiempoEstimadoBaseMin,
          r.estado,
        ],
      );

      if (r.tramos && r.tramos.length > 0) {
        for (const t of r.tramos) {
          await this.db.runAsync(
            `INSERT OR REPLACE INTO tramos 
             (id, ruta_id, orden_secuencia, origen_lat, origen_lon, destino_lat, destino_lon, via_codigo, distancia_km, tiempo_base_min) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              t.id,
              r.id,
              t.ordenSecuencia,
              t.origenLat,
              t.origenLon,
              t.destinoLat,
              t.destinoLon,
              t.viaCodigo || null,
              t.distanciaKm,
              t.tiempoBaseMin,
            ],
          );
        }
      }
    }
  }

  async getRoutes(): Promise<RouteModel[]> {
    await this.init();
    if (!this.db) return [];

    const rows: any[] = await this.db.getAllAsync('SELECT * FROM rutas ORDER BY eta_pactado ASC');
    return rows.map((row) => ({
      id: row.id,
      usuarioId: row.usuario_id,
      codigoManifiesto: row.codigo_manifiesto,
      origenNombre: row.origen_nombre,
      origenLat: row.origen_lat,
      origenLon: row.origen_lon,
      destinoNombre: row.destino_nombre,
      destinoLat: row.destino_lat,
      destinoLon: row.destino_lon,
      etaPactado: row.eta_pactado,
      etaRecalculado: row.eta_recalculado,
      distanciaTotalKm: row.distancia_total_km,
      tiempoEstimadoBaseMin: row.tiempo_estimado_base_min,
      estado: row.estado,
    }));
  }

  async saveIncidents(incidents: IncidentModel[]): Promise<void> {
    await this.init();
    if (!this.db) return;

    for (const inc of incidents) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO incidentes 
         (id, id_fuente_externa, tipo_evento, gravedad, descripcion, via_codigo, latitud, longitud, radio_afectacion_km, retraso_estimado_min, fuente, estado, fecha_reporte) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          inc.id,
          inc.idFuenteExterna || null,
          inc.tipoEvento,
          inc.gravedad,
          inc.descripcion,
          inc.viaCodigo || null,
          inc.latitud,
          inc.longitud,
          inc.radioAfectacionKm,
          inc.retrasoEstimadoMin,
          inc.fuente,
          inc.estado,
          inc.fechaReporte,
        ],
      );
    }
  }

  async getActiveIncidents(): Promise<IncidentModel[]> {
    await this.init();
    if (!this.db) return [];

    const rows: any[] = await this.db.getAllAsync('SELECT * FROM incidentes WHERE estado = "activo"');
    return rows.map((row) => ({
      id: row.id,
      idFuenteExterna: row.id_fuente_externa,
      tipoEvento: row.tipo_evento,
      gravedad: row.gravedad,
      descripcion: row.descripcion,
      viaCodigo: row.via_codigo,
      latitud: row.latitud,
      longitud: row.longitud,
      radioAfectacionKm: row.radio_afectacion_km,
      retrasoEstimadoMin: row.retraso_estimado_min,
      fuente: row.fuente,
      estado: row.estado,
      fechaReporte: row.fecha_reporte,
    }));
  }

  async addTelemetryPoint(
    rutaId: string,
    latitud: number,
    longitud: number,
    velocidadKmh?: number,
    altitud?: number,
    bateriaNivel?: number,
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    await this.db.runAsync(
      `INSERT INTO telemetria_buffer 
       (ruta_id, latitud, longitud, velocidad_kmh, altitud, bateria_nivel, timestamp_captura, sincronizado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        rutaId,
        latitud,
        longitud,
        velocidadKmh || null,
        altitud || null,
        bateriaNivel || null,
        new Date().toISOString(),
      ],
    );
  }

  async getUnsyncedTelemetry(limit = 100): Promise<any[]> {
    await this.init();
    if (!this.db) return [];

    return this.db.getAllAsync(
      'SELECT * FROM telemetria_buffer WHERE sincronizado = 0 ORDER BY id ASC LIMIT ?',
      [limit],
    );
  }

  async markTelemetrySynced(ids: number[]): Promise<void> {
    await this.init();
    if (!this.db || ids.length === 0) return;

    const placeholders = ids.map(() => '?').join(',');
    await this.db.runAsync(
      `UPDATE telemetria_buffer SET sincronizado = 1 WHERE id IN (${placeholders})`,
      ids,
    );
  }
}

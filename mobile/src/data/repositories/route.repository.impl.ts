import { IRouteRepository } from '../../domain/repositories/route.repository.interface';
import { RouteModel } from '../../domain/entities/route.model';
import { IncidentModel } from '../../domain/entities/incident.model';
import { SQLiteDataSource } from '../datasources/sqlite.datasource';
import { ApiDataSource } from '../datasources/api.datasource';
import { IDelayEvaluationResult, ITelemetryPayload } from '../../shared/types';
import { CalculateDelayUseCase } from '../../domain/use-cases/calculate-delay.usecase';

export class RouteRepositoryImpl implements IRouteRepository {
  constructor(
    private readonly sqliteDs: SQLiteDataSource,
    private readonly apiDs: ApiDataSource,
  ) {}

  async getRoutes(): Promise<RouteModel[]> {
    try {
      // Intentar obtener desde la red (NestJS API)
      const remoteRoutes = await this.apiDs.fetchRoutes();
      // Persistir en SQLite para disponibilidad offline
      await this.sqliteDs.saveRoutes(remoteRoutes);
      return remoteRoutes;
    } catch {
      // Si la red falla (pasos de cordillera sin 4G), leer de SQLite local
      return this.sqliteDs.getRoutes();
    }
  }

  async getRouteById(id: string): Promise<RouteModel | null> {
    const routes = await this.sqliteDs.getRoutes();
    return routes.find((r) => r.id === id) || null;
  }

  async saveRoutesLocally(routes: RouteModel[]): Promise<void> {
    await this.sqliteDs.saveRoutes(routes);
  }

  async getActiveIncidents(): Promise<IncidentModel[]> {
    try {
      const remoteIncidents = await this.apiDs.fetchIncidents();
      await this.sqliteDs.saveIncidents(remoteIncidents);
      return remoteIncidents;
    } catch {
      return this.sqliteDs.getActiveIncidents();
    }
  }

  async saveIncidentsLocally(incidents: IncidentModel[]): Promise<void> {
    await this.sqliteDs.saveIncidents(incidents);
  }

  async syncTelemetryBuffer(payload: ITelemetryPayload): Promise<boolean> {
    try {
      await this.apiDs.sendTelemetryBatch(payload);
      return true;
    } catch {
      return false;
    }
  }

  async evaluateRouteDelay(routeId: string): Promise<IDelayEvaluationResult> {
    try {
      // Intentar cálculo en backend si hay red
      return await this.apiDs.evaluateDelay(routeId);
    } catch {
      // Fallback offline: calcular localmente con lógica de dominio pura y SQLite
      const route = await this.getRouteById(routeId);
      if (!route) {
        throw new Error('Ruta no encontrada localmente');
      }
      const incidents = await this.sqliteDs.getActiveIncidents();
      return CalculateDelayUseCase.execute(route, incidents);
    }
  }
}

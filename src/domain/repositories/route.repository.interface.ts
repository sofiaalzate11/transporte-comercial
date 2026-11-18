import { RouteModel } from '../entities/route.model';
import { IncidentModel } from '../entities/incident.model';
import { IDelayEvaluationResult, ITelemetryPayload } from '../../shared/types';

export interface IRouteRepository {
  getRoutes(): Promise<RouteModel[]>;
  getRouteById(id: string): Promise<RouteModel | null>;
  saveRoutesLocally(routes: RouteModel[]): Promise<void>;
  getActiveIncidents(): Promise<IncidentModel[]>;
  saveIncidentsLocally(incidents: IncidentModel[]): Promise<void>;
  syncTelemetryBuffer(payload: ITelemetryPayload): Promise<boolean>;
  evaluateRouteDelay(routeId: string): Promise<IDelayEvaluationResult>;
  createRoute(dto: any): Promise<RouteModel>;
  updateRouteStatus(routeId: string, estado: string): Promise<RouteModel>;
  getDrivers(): Promise<Array<{ id: string; nombre: string; documento: string; rol: string }>>;
}

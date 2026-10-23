// Re-exportación desde shared/types del monorepo
// Este archivo actúa como alias local para el compilador de NestJS

export enum UserRole {
  DRIVER = 'conductor',
  DISPATCHER = 'operador',
  CUSTOMER = 'consulta',
}

export enum RouteStatus {
  PENDING = 'pendiente',
  IN_TRANSIT = 'en_ruta',
  COMPLETED = 'completada',
  DELAYED = 'retrasada',
  CANCELLED = 'cancelada',
}

export enum IncidentType {
  TOTAL_CLOSURE = 'cierre_total',
  ONE_LANE_PASS = 'paso_a_un_carril',
  LANDSLIDE = 'derrumbe',
  MAINTENANCE = 'mantenimiento',
  ACCIDENT = 'accidente',
  WEATHER = 'clima',
  PROTEST = 'manifestacion',
}

export enum IncidentSeverity {
  LOW = 'baja',
  MEDIUM = 'media',
  HIGH = 'alta',
  CRITICAL = 'critica',
}

export interface ICoordinates {
  latitude: number;
  longitude: number;
}

export interface ITelemetryPayload {
  routeId: string;
  points: {
    latitude: number;
    longitude: number;
    speedKmh: number;
    altitude: number;
    batteryLevel: number;
    capturedAt: string;
  }[];
}

export interface IDelayEvaluationResult {
  routeId: string;
  recalculatedEta: string;
  deltaMinutes: number;
  isDelayed: boolean;
  affectingIncidentsCount: number;
}

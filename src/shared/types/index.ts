export enum UserRole {
  DRIVER = 'conductor',
  DISPATCHER = 'operador',
  CUSTOMER = 'consulta',
}

export enum RouteStatus {
  PENDING = 'pendiente',
  IN_TRANSIT = 'en_ruta',
  SUSPENDED = 'en_suspension',
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

/* -------------------------------------------------------------------------- */
/* SOF-01: Contratos RNDC y tipología vehicular                               */
/* -------------------------------------------------------------------------- */

/** Tipología RNDC para vehículos de carga colombianos. */
export enum VehicleType {
  C2 = 'C2',
  C3 = 'C3',
  C3S3 = 'C3S3',
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  [VehicleType.C2]: 'Camión sencillo de 2 ejes',
  [VehicleType.C3]: 'Dobletroque de 3 ejes',
  [VehicleType.C3S3]: 'Tractocamión con semirremolque de 3 ejes',
};

export enum CargoType {
  SECA = 'seca',
  REFRIGERADA = 'refrigerada',
  PELIGROSA = 'peligrosa',
}

export interface CargoDetails {
  tipoMercancia: CargoType;
  pesoKg: number;
  volumenM3: number;
  valorAseguradoCop: number;
}

/* -------------------------------------------------------------------------- */
/* SOF-02: Prueba de entrega digital (POD)                                    */
/* -------------------------------------------------------------------------- */

export interface IProofOfDelivery {
  /** Trazado vectorial de la firma capturada en pantalla, codificado en Base64. */
  firmaBase64: string;
  nombreReceptor: string;
  cedulaReceptor: string;
  observaciones?: string;
  /** URIs de las fotografías de la carga entregada. */
  fotosEvidencia: string[];
  /** ISO 8601, por ejemplo 2026-11-25T14:30:00-05:00. */
  fechaHoraEntrega: string;
  latitudEntrega: number;
  longitudEntrega: number;
}

/* -------------------------------------------------------------------------- */
/* SOF-03: Inspección pre-operacional                                         */
/* -------------------------------------------------------------------------- */

export interface IVehicleInspection {
  frenos: boolean;
  nivelAceite: boolean;
  presionLlantas: boolean;
  luces: boolean;
  kitCarreteras: boolean;
  soatVigente: boolean;
  soatVencimiento: string;
  revisionTecnicoMecanicaVigente: boolean;
  revisionTecnicoMecanicaVencimiento: string;
  /** Firma de conformidad del conductor antes de encender el motor (Base64). */
  firmaConformidadConductor: string;
  fechaInspeccion: string;
  observaciones?: string;
}

/* -------------------------------------------------------------------------- */
/* SOF-04: Estaciones de peaje y tarifas viales                               */
/* -------------------------------------------------------------------------- */

export enum TollCategory {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V',
}

export interface ITollStation {
  nombrePeaje: string;
  concesionVial: string;
  latitud: number;
  longitud: number;
  /** Tarifa oficial por categoría, en pesos colombianos (COP). */
  tarifas: Record<TollCategory, number>;
  actualizadoEn?: string;
}

/** Relación entre la tipología RNDC y la categoría de peaje correspondiente. */
export const VEHICLE_TOLL_CATEGORY: Record<VehicleType, TollCategory> = {
  [VehicleType.C2]: TollCategory.II,
  [VehicleType.C3]: TollCategory.III,
  [VehicleType.C3S3]: TollCategory.V,
};

/* -------------------------------------------------------------------------- */
/* SOF-05 / SOF-06: Seguimiento público por manifiesto                        */
/* -------------------------------------------------------------------------- */

export enum ShipmentStage {
  SALIDA = 'salida',
  EN_TRANSITO = 'en_transito',
  LLEGADA = 'llegada',
}

export const SHIPMENT_STAGE_LABELS: Record<ShipmentStage, string> = {
  [ShipmentStage.SALIDA]: 'Salida',
  [ShipmentStage.EN_TRANSITO]: 'En Tránsito',
  [ShipmentStage.LLEGADA]: 'Llegada',
};

export interface IShipmentIncident {
  tipo: IncidentType;
  descripcion: string;
  registradoEn: string;
  impactoMinutos: number;
  severidad?: IncidentSeverity;
}

export interface ISeguimientoRemesa {
  /** Código público con formato MAN-XXXXX. */
  codigoManifiesto: string;
  etapa: ShipmentStage;
  estado: RouteStatus;
  origen: string;
  destino: string;
  etaBase: string;
  etaAjustado: string;
  minutosAjuste: number;
  incidentes: IShipmentIncident[];
  ultimoReporte: {
    latitud: number;
    longitud: number;
    registradoEn: string;
    descripcion?: string;
  };
  conductor?: string;
  placa?: string;
  /** true cuando la respuesta viene del proveedor local de demostración. */
  esDemostracion?: boolean;
}

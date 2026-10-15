export type AlertSeverity = 'ALTA' | 'MEDIA' | 'BAJA';
export type AlertType = 'CIERRE_TOTAL' | 'CIERRE_PARCIAL' | 'PASO_A_UN_CARRIL' | 'DERRUMBE' | 'MANTENIMIENTO';

export interface RoadAlert {
  id: string;
  department: string;
  roadName: string;
  sector: string;
  alertType: AlertType;
  severity: AlertSeverity;
  description: string;
  latitude: number;
  longitude: number;
  reportedAt: string; // ISO-8601 UTC-5
  updatedAt: string;
  isResolved: boolean;
}

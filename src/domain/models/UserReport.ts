
export type UserIncidentType =
  | 'DERRUMBE'
  | 'ACCIDENTE'
  | 'VARADO'
  | 'OBRAS'
  | 'OTRO';

export interface UserReport {
  id: string;
  roadName: string;
  kilometer: number;
  description: string;
  incidentType: UserIncidentType;
  createdAt: string;
}

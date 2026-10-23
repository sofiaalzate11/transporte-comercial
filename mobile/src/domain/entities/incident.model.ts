import { IncidentType, IncidentSeverity } from '../../../../shared/types';

export interface IncidentModel {
  id: string;
  idFuenteExterna?: string;
  tipoEvento: IncidentType;
  gravedad: IncidentSeverity;
  descripcion: string;
  viaCodigo?: string;
  latitud: number;
  longitud: number;
  radioAfectacionKm: number;
  retrasoEstimadoMin: number;
  fuente: string;
  estado: string;
  fechaReporte: string;
}

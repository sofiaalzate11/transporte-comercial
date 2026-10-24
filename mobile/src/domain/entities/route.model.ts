import { RouteStatus } from '../../shared/types';

export interface RouteSegmentModel {
  id: string;
  ordenSecuencia: number;
  origenLat: number;
  origenLon: number;
  destinoLat: number;
  destinoLon: number;
  viaCodigo?: string;
  distanciaKm: number;
  tiempoBaseMin: number;
}

export interface RouteModel {
  id: string;
  usuarioId: string;
  codigoManifiesto?: string;
  origenNombre: string;
  origenLat: number;
  origenLon: number;
  destinoNombre: string;
  destinoLat: number;
  destinoLon: number;
  etaPactado: string;
  etaRecalculado?: string;
  distanciaTotalKm: number;
  tiempoEstimadoBaseMin: number;
  estado: RouteStatus;
  tramos?: RouteSegmentModel[];
}

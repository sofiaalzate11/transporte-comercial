import { RouteModel } from '../entities/route.model';
import { IncidentModel } from '../entities/incident.model';
import { IDelayEvaluationResult } from '../../shared/types';

export class CalculateDelayUseCase {
  /**
   * Distancia en kilómetros entre dos coordenadas usando la fórmula de Haversine.
   */
  static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Evalúa los retrasos ocasionados por incidentes que intersecan la ruta.
   */
  static execute(route: RouteModel, activeIncidents: IncidentModel[]): IDelayEvaluationResult {
    let totalDelayMinutes = 0;
    let affectingIncidentsCount = 0;

    for (const incident of activeIncidents) {
      let isIncidentAffecting = false;

      // Verificar proximidad a origen o destino
      const distToOrigin = this.calculateDistanceKm(route.origenLat, route.origenLon, incident.latitud, incident.longitud);
      const distToDest = this.calculateDistanceKm(route.destinoLat, route.destinoLon, incident.latitud, incident.longitud);

      if (distToOrigin <= incident.radioAfectacionKm || distToDest <= incident.radioAfectacionKm) {
        isIncidentAffecting = true;
      }

      // Verificar tramos intermedios si existen
      if (!isIncidentAffecting && route.tramos && route.tramos.length > 0) {
        for (const tramo of route.tramos) {
          const distSegmentStart = this.calculateDistanceKm(tramo.origenLat, tramo.origenLon, incident.latitud, incident.longitud);
          const distSegmentEnd = this.calculateDistanceKm(tramo.destinoLat, tramo.destinoLon, incident.latitud, incident.longitud);

          if (distSegmentStart <= incident.radioAfectacionKm || distSegmentEnd <= incident.radioAfectacionKm) {
            isIncidentAffecting = true;
            break;
          }
        }
      }

      if (isIncidentAffecting) {
        affectingIncidentsCount++;
        totalDelayMinutes += incident.retrasoEstimadoMin;
      }
    }

    const baseEta = new Date(route.etaPactado).getTime();
    const recalculatedTimestamp = new Date(baseEta + totalDelayMinutes * 60 * 1000);

    return {
      routeId: route.id,
      recalculatedEta: recalculatedTimestamp.toISOString(),
      deltaMinutes: totalDelayMinutes,
      isDelayed: totalDelayMinutes > 0,
      affectingIncidentsCount,
    };
  }
}

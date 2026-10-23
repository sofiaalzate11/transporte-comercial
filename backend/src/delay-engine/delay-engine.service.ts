import { Injectable } from '@nestjs/common';
import { RouteEntity } from '../routes/entities/route.entity';
import { RoadIncidentEntity } from '../road-incidents/entities/road-incident.entity';
import { IDelayEvaluationResult } from '../shared/types';

@Injectable()
export class DelayEngineService {
  /**
   * Calcula la distancia en kilómetros entre dos coordenadas usando la fórmula de Haversine.
   */
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio medio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Evalúa los incidentes que intersectan los tramos de la ruta y recalcula el ETA proyectado.
   */
  evaluateRouteDelay(route: RouteEntity, activeIncidents: RoadIncidentEntity[]): IDelayEvaluationResult {
    let totalDelayMinutes = 0;
    const affectingIncidents = new Set<string>();

    // Evaluar cada tramo contra cada incidente activo
    for (const incident of activeIncidents) {
      let incidentAffectsRoute = false;

      // Verificar si el incidente está cerca del origen o destino general
      const distToOrigin = this.calculateDistanceKm(route.origenLat, route.origenLon, incident.latitud, incident.longitud);
      const distToDest = this.calculateDistanceKm(route.destinoLat, route.destinoLon, incident.latitud, incident.longitud);

      if (distToOrigin <= incident.radioAfectacionKm || distToDest <= incident.radioAfectacionKm) {
        incidentAffectsRoute = true;
      }

      // Verificar si afecta alguno de los tramos intermedios
      if (!incidentAffectsRoute && route.tramos) {
        for (const segment of route.tramos) {
          const distToSegmentStart = this.calculateDistanceKm(segment.origenLat, segment.origenLon, incident.latitud, incident.longitud);
          const distToSegmentEnd = this.calculateDistanceKm(segment.destinoLat, segment.destinoLon, incident.latitud, incident.longitud);

          if (distToSegmentStart <= incident.radioAfectacionKm || distToSegmentEnd <= incident.radioAfectacionKm) {
            incidentAffectsRoute = true;
            break;
          }
        }
      }

      if (incidentAffectsRoute && !affectingIncidents.has(incident.id)) {
        affectingIncidents.add(incident.id);
        totalDelayMinutes += incident.retrasoEstimadoMin;
      }
    }

    const promisedTime = new Date(route.etaPactado).getTime();
    const recalculatedTime = new Date(promisedTime + totalDelayMinutes * 60 * 1000);

    return {
      routeId: route.id,
      recalculatedEta: recalculatedTime.toISOString(),
      deltaMinutes: totalDelayMinutes,
      isDelayed: totalDelayMinutes > 0,
      affectingIncidentsCount: affectingIncidents.size,
    };
  }
}

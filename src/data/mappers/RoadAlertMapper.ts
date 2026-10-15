import { RoadAlert, AlertSeverity, AlertType } from '../../domain/models/RoadAlert';
import { InviasFeature } from '../datasources/remote/InviasArcGisClient';

export class RoadAlertMapper {
  public static fromFeature(feature: InviasFeature): RoadAlert {
    const attr = feature.attributes;
    const geom = feature.geometry;

    const alertType = RoadAlertMapper.normalizeAlertType(attr.EVENTO, attr.ESTADO);
    const severity = RoadAlertMapper.calculateSeverity(alertType);

    const repDate = attr.FECHA_REPORTE
      ? new Date(attr.FECHA_REPORTE).toISOString()
      : new Date().toISOString();

    const upDate = attr.FECHA_ACTUALIZACION
      ? new Date(attr.FECHA_ACTUALIZACION).toISOString()
      : repDate;

    return {
      id: `invias-${attr.OBJECTID}`,
      department: (attr.DEPARTAMENTO || 'COLOMBIA').toUpperCase(),
      roadName: attr.VIA || 'Red Nacional',
      sector: attr.SECTOR || 'Sector sin especificar',
      alertType,
      severity,
      description: attr.OBSERVACION || attr.ESTADO || 'Incidencia vial en curso',
      latitude: geom?.y ?? 4.5709,
      longitude: geom?.x ?? -74.2973,
      reportedAt: repDate,
      updatedAt: upDate,
      isResolved: (attr.ESTADO || '').toUpperCase().includes('NORMALIZADO'),
    };
  }

  private static normalizeAlertType(evento?: string, estado?: string): AlertType {
    const text = `${evento || ''} ${estado || ''}`.toUpperCase();
    if (text.includes('CIERRE TOTAL')) return 'CIERRE_TOTAL';
    if (text.includes('DERRUMBE') || text.includes('DESLIZAMIENTO')) return 'DERRUMBE';
    if (text.includes('PASO A UN CARRIL') || text.includes('UN CARRIL')) return 'PASO_A_UN_CARRIL';
    if (text.includes('CIERRE PARCIAL') || text.includes('RESTRINGIDO')) return 'CIERRE_PARCIAL';
    return 'MANTENIMIENTO';
  }

  private static calculateSeverity(type: AlertType): AlertSeverity {
    switch (type) {
      case 'CIERRE_TOTAL':
      case 'DERRUMBE':
        return 'ALTA';
      case 'PASO_A_UN_CARRIL':
      case 'CIERRE_PARCIAL':
        return 'MEDIA';
      default:
        return 'BAJA';
    }
  }
}

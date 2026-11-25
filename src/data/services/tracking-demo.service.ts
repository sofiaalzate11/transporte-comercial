import {
  IncidentSeverity,
  IncidentType,
  ISeguimientoRemesa,
  RouteStatus,
  ShipmentStage,
} from '../../shared/types';
import {
  normalizarCodigoManifiesto,
  validarCodigoManifiesto,
} from '../../shared/utils/manifiesto.validation';

const MINUTO_EN_MS = 60_000;

/**
 * Proveedor local de demostración while the public tracking endpoint is not
 * connected. It always returns deterministic data for a MAN-XXXXX code so QA
 * can validate SOF-05 and SOF-06 without an operator session or backend.
 */
export async function consultarRemesaDemo(
  codigo: string,
): Promise<ISeguimientoRemesa> {
  const error = validarCodigoManifiesto(codigo);
  if (error) {
    throw new Error(error);
  }

  const codigoNormalizado = normalizarCodigoManifiesto(codigo);
  const semilla = Number(codigoNormalizado.slice(4));
  const ahora = Date.now();
  const etapas: ShipmentStage[] = [
    ShipmentStage.SALIDA,
    ShipmentStage.EN_TRANSITO,
    ShipmentStage.LLEGADA,
  ];
  const etapa = etapas[semilla % etapas.length];
  const minutosBase = 90 + ((semilla * 17) % 300);

  const incidentes: ISeguimientoRemesa['incidentes'] =
    semilla % 2 === 0
      ? [
          {
            tipo: IncidentType.LANDSLIDE,
            descripcion: 'Derrumbe reportado por INVIAS en el corredor; se habilitó paso alterno.',
            registradoEn: new Date(ahora - 25 * MINUTO_EN_MS).toISOString(),
            impactoMinutos: 35 + (semilla % 40),
          },
        ]
      : [];

  if (semilla % 5 === 0 && incidentes.length > 0) {
    incidentes.push({
      tipo: IncidentType.ONE_LANE_PASS,
      descripcion: 'Paso a un carril por mantenimiento de la vía.',
      registradoEn: new Date(ahora - 10 * MINUTO_EN_MS).toISOString(),
      impactoMinutos: 15,
      severidad: IncidentSeverity.MEDIUM,
    });
  }

  const minutosAjuste = incidentes.reduce(
    (total, incidente) => total + incidente.impactoMinutos,
    0,
  );

  const etaBase = new Date(ahora + minutosBase * MINUTO_EN_MS).toISOString();
  const etaAjustado = new Date(
    ahora + (minutosBase + minutosAjuste) * MINUTO_EN_MS,
  ).toISOString();

  const estado: RouteStatus =
    etapa === ShipmentStage.LLEGADA
      ? RouteStatus.COMPLETED
      : incidentes.length > 0
        ? RouteStatus.DELAYED
        : etapa === ShipmentStage.SALIDA
          ? RouteStatus.PENDING
          : RouteStatus.IN_TRANSIT;

  return {
    codigoManifiesto: codigoNormalizado,
    etapa,
    estado,
    origen: 'Bogotá D.C.',
    destino: semilla % 3 === 0 ? 'Buenaventura' : semilla % 3 === 1 ? 'Cali' : 'Medellín',
    etaBase,
    etaAjustado,
    minutosAjuste,
    incidentes,
    ultimoReporte: {
      latitud: Number((4.45 + (semilla % 40) / 100).toFixed(4)),
      longitud: Number((-74.2 - (semilla % 30) / 100).toFixed(4)),
      registradoEn: new Date(ahora - 8 * MINUTO_EN_MS).toISOString(),
      descripcion: 'Última telemetría recibida del dispositivo del conductor.',
    },
    conductor: 'Conductor Prueba',
    placa: `RNDC-${String(semilla).padStart(3, '0')}`,
    esDemostracion: true,
  };
}

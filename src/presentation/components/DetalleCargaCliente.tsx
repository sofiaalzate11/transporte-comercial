import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  ISeguimientoRemesa,
  SHIPMENT_STAGE_LABELS,
  ShipmentStage,
} from '../../shared/types';

interface Props {
  seguimiento: ISeguimientoRemesa;
}

const ETAPAS: ShipmentStage[] = [
  ShipmentStage.SALIDA,
  ShipmentStage.EN_TRANSITO,
  ShipmentStage.LLEGADA,
];

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha no disponible';
  }
  return fecha.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const DetalleCargaCliente: React.FC<Props> = ({ seguimiento }) => {
  const indiceActual = ETAPAS.indexOf(seguimiento.etapa);

  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <Text style={styles.codigo}>{seguimiento.codigoManifiesto}</Text>
        <Text style={styles.estado}>{seguimiento.estado.replace(/_/g, ' ')}</Text>
      </View>

      <Text style={styles.ruta}>
        {seguimiento.origen} → {seguimiento.destino}
      </Text>

      <Text style={styles.tituloSeccion}>Estado del viaje</Text>
      <View style={styles.progresoContenedor}>
        <View style={styles.lineaBase} />
        <View
          style={[
            styles.lineaActiva,
            { width: `${(indiceActual / (ETAPAS.length - 1)) * 100}%` },
          ]}
        />
        <View style={styles.pasos}>
          {ETAPAS.map((etapa, indice) => {
            const completado = indice <= indiceActual;
            return (
              <View key={etapa} style={styles.paso}>
                <View
                  style={[styles.circulo, completado && styles.circuloActivo]}
                />
                <Text
                  style={[styles.etiquetaPaso, completado && styles.etiquetaActiva]}
                >
                  {SHIPMENT_STAGE_LABELS[etapa]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.bloqueEta}>
        <View style={styles.columnaEta}>
          <Text style={styles.etiquetaEta}>ETA original</Text>
          <Text style={styles.valorEta}>{formatearFecha(seguimiento.etaBase)}</Text>
        </View>
        <View style={styles.columnaEta}>
          <Text style={styles.etiquetaEta}>ETA ajustado</Text>
          <Text style={[styles.valorEta, styles.valorEtaAjustado]}>
            {formatearFecha(seguimiento.etaAjustado)}
          </Text>
        </View>
      </View>

      {seguimiento.minutosAjuste > 0 ? (
        <Text style={styles.avisoRetraso}>
          +{seguimiento.minutosAjuste} min por incidentes reportados en la vía
        </Text>
      ) : (
        <Text style={styles.avisoNormal}>
          Sin incidencias que afecten el tiempo estimado
        </Text>
      )}

      {seguimiento.incidentes.length > 0 ? (
        <View style={styles.bloqueIncidentes}>
          <Text style={styles.tituloSeccion}>Novedades de la ruta</Text>
          {seguimiento.incidentes.map((incidente) => (
            <View key={`${incidente.tipo}-${incidente.registradoEn}`} style={styles.incidente}>
              <Text style={styles.incidenteTipo}>
                {incidente.tipo.replace(/_/g, ' ')} · +{incidente.impactoMinutos} min
              </Text>
              <Text style={styles.incidenteTexto}>{incidente.descripcion}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.bloqueReporte}>
        <Text style={styles.tituloSeccion}>Último reporte</Text>
        <Text style={styles.textoReporte}>
          {formatearFecha(seguimiento.ultimoReporte.registradoEn)}
        </Text>
        <Text style={styles.coordenadas}>
          Lat {seguimiento.ultimoReporte.latitud.toFixed(4)} · Lon{' '}
          {seguimiento.ultimoReporte.longitud.toFixed(4)}
        </Text>
        {seguimiento.ultimoReporte.descripcion ? (
          <Text style={styles.textoReporte}>
            {seguimiento.ultimoReporte.descripcion}
          </Text>
        ) : null}
      </View>

      {seguimiento.conductor || seguimiento.placa ? (
        <Text style={styles.conductor}>
          {[seguimiento.conductor, seguimiento.placa].filter(Boolean).join(' · ')}
        </Text>
      ) : null}

      {seguimiento.esDemostracion ? (
        <Text style={styles.avisoDemo}>
          Información de demostración. Conecta el servicio público de tracking para
          datos en tiempo real.
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  tarjeta: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  codigo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  estado: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e3a8a',
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    textTransform: 'capitalize',
  },
  ruta: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  tituloSeccion: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  progresoContenedor: {
    height: 54,
    justifyContent: 'flex-end',
    marginBottom: 18,
  },
  lineaBase: {
    position: 'absolute',
    top: 8,
    left: 12,
    right: 12,
    height: 3,
    backgroundColor: '#cbd5e1',
  },
  lineaActiva: {
    position: 'absolute',
    top: 8,
    left: 12,
    height: 3,
    backgroundColor: '#1e3a8a',
  },
  pasos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paso: {
    alignItems: 'center',
    width: '33%',
  },
  circulo: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#94a3b8',
    marginBottom: 6,
  },
  circuloActivo: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  etiquetaPaso: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  etiquetaActiva: {
    color: '#1e3a8a',
    fontWeight: '700',
  },
  bloqueEta: {
    flexDirection: 'row',
    gap: 12,
  },
  columnaEta: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
  },
  etiquetaEta: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  valorEta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  valorEtaAjustado: {
    color: '#1e3a8a',
  },
  avisoRetraso: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#b45309',
  },
  avisoNormal: {
    marginTop: 10,
    fontSize: 12,
    color: '#15803d',
  },
  bloqueIncidentes: {
    marginTop: 16,
  },
  incidente: {
    backgroundColor: '#fff7ed',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  incidenteTipo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9a3412',
    textTransform: 'capitalize',
  },
  incidenteTexto: {
    marginTop: 3,
    fontSize: 12,
    color: '#7c2d12',
    lineHeight: 17,
  },
  bloqueReporte: {
    marginTop: 12,
  },
  textoReporte: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  coordenadas: {
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: '600',
    marginVertical: 2,
  },
  conductor: {
    marginTop: 12,
    fontSize: 12,
    color: '#64748b',
  },
  avisoDemo: {
    marginTop: 12,
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 15,
  },
});

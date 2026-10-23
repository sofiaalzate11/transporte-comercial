import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { useRoutesStore } from '../../src/presentation/stores/routes.store';
import { IncidentBadge } from '../../src/presentation/components/IncidentBadge';

// Inicializar MapLibre sin access token para fuentes abiertas de teselas vectoriales (OSM / MapLibre demo)
MapLibreGL.setAccessToken(null);

export default function MapaScreen() {
  const { incidentes, rutaSeleccionada } = useRoutesStore();

  const centerCoords = rutaSeleccionada
    ? [rutaSeleccionada.origenLon, rutaSeleccionada.origenLat]
    : [-74.0817, 4.6097]; // Coordenadas Bogotá por defecto

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
      >
        <MapLibreGL.Camera
          zoomLevel={6.5}
          centerCoordinate={centerCoords}
          animationMode="flyTo"
          animationDuration={1500}
        />

        {/* Marcadores de incidentes viales activos */}
        {incidentes.map((inc) => (
          <MapLibreGL.PointAnnotation
            key={inc.id}
            id={inc.id}
            coordinate={[inc.longitud, inc.latitud]}
          >
            <View style={styles.markerContainer}>
              <IncidentBadge gravedad={inc.gravedad} tipo={inc.tipoEvento} />
            </View>
            <MapLibreGL.Callout title={`${inc.tipoEvento}: ${inc.descripcion}`} />
          </MapLibreGL.PointAnnotation>
        ))}

        {/* Marcadores de Origen y Destino de la Ruta Seleccionada */}
        {rutaSeleccionada && (
          <>
            <MapLibreGL.PointAnnotation
              id="origen"
              coordinate={[rutaSeleccionada.origenLon, rutaSeleccionada.origenLat]}
            >
              <View style={[styles.endpointMarker, styles.originMarker]}>
                <Text style={styles.endpointText}>A</Text>
              </View>
              <MapLibreGL.Callout title={`Origen: ${rutaSeleccionada.origenNombre}`} />
            </MapLibreGL.PointAnnotation>

            <MapLibreGL.PointAnnotation
              id="destino"
              coordinate={[rutaSeleccionada.destinoLon, rutaSeleccionada.destinoLat]}
            >
              <View style={[styles.endpointMarker, styles.destMarker]}>
                <Text style={styles.endpointText}>B</Text>
              </View>
              <MapLibreGL.Callout title={`Destino: ${rutaSeleccionada.destinoNombre}`} />
            </MapLibreGL.PointAnnotation>
          </>
        )}
      </MapLibreGL.MapView>

      {rutaSeleccionada && (
        <View style={styles.overlayBanner}>
          <Text style={styles.overlayTitle}>Ruta Activa</Text>
          <Text style={styles.overlayRoute}>
            {rutaSeleccionada.origenNombre} → {rutaSeleccionada.destinoNombre}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    padding: 2,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    elevation: 3,
  },
  endpointMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  originMarker: {
    backgroundColor: '#2563eb',
  },
  destMarker: {
    backgroundColor: '#16a34a',
  },
  endpointText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  overlayBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  overlayTitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  overlayRoute: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
});

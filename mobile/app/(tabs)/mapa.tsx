import React, { useMemo } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoutesStore } from '../../src/presentation/stores/routes.store';

export default function MapaScreen() {
  const { incidentes, rutaSeleccionada } = useRoutesStore();

  const htmlContent = useMemo(() => {
    const centerLat = rutaSeleccionada ? rutaSeleccionada.origenLat : 4.5709;
    const centerLon = rutaSeleccionada ? rutaSeleccionada.origenLon : -74.2973;
    const initialZoom = rutaSeleccionada ? 8 : 6;

    // Marcadores de incidentes
    const incidentsJson = JSON.stringify(
      incidentes.map((inc) => ({
        lat: inc.latitud,
        lon: inc.longitud,
        tipo: inc.tipoEvento,
        gravedad: inc.gravedad,
        descripcion: inc.descripcion,
        via: inc.viaCodigo || 'Vía Nacional',
        retraso: inc.retrasoEstimadoMin,
        radio: inc.radioAfectacionKm,
      })),
    );

    // Ruta seleccionada
    const routeJson = JSON.stringify(
      rutaSeleccionada
        ? {
            origen: {
              lat: rutaSeleccionada.origenLat,
              lon: rutaSeleccionada.origenLon,
              nombre: rutaSeleccionada.origenNombre,
            },
            destino: {
              lat: rutaSeleccionada.destinoLat,
              lon: rutaSeleccionada.destinoLon,
              nombre: rutaSeleccionada.destinoNombre,
            },
            estado: rutaSeleccionada.estado,
          }
        : null,
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
          .custom-popup { font-family: sans-serif; font-size: 12px; line-height: 1.4; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; color: #fff; font-weight: bold; font-size: 10px; margin-bottom: 4px; }
          .badge-critica { background-color: #dc2626; }
          .badge-alta { background-color: #ea580c; }
          .badge-media { background-color: #d97706; }
          .badge-baja { background-color: #0284c7; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: true }).setView([${centerLat}, ${centerLon}], ${initialZoom});

          // Capa oficial de OpenStreetMap
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          const incidents = ${incidentsJson};
          const route = ${routeJson};

          // Renderizar incidentes viales de INVIAS
          incidents.forEach(inc => {
            const circleColor = inc.gravedad === 'critica' ? '#dc2626' : (inc.gravedad === 'alta' ? '#ea580c' : '#d97706');
            
            // Radio de afectación en carretera
            L.circle([inc.lat, inc.lon], {
              radius: (inc.radio || 1) * 1000,
              color: circleColor,
              fillColor: circleColor,
              fillOpacity: 0.25
            }).addTo(map);

            // Marcador con popup interactivo
            const popupContent = \`
              <div class="custom-popup">
                <span class="badge badge-\${inc.gravedad}">\${inc.tipo.toUpperCase()}</span>
                <div><strong>\${inc.via}</strong></div>
                <div>\${inc.descripcion}</div>
                <div><em>Retraso: +\${inc.retraso} min</em></div>
              </div>
            \`;
            L.marker([inc.lat, inc.lon]).addTo(map).bindPopup(popupContent);
          });

          // Renderizar ruta activa
          if (route) {
            const origen = [route.origen.lat, route.origen.lon];
            const destino = [route.destino.lat, route.destino.lon];

            // Marcadores de origen (A) y destino (B)
            L.marker(origen).addTo(map).bindPopup('<strong>ORIGEN (A):</strong> ' + route.origen.nombre);
            L.marker(destino).addTo(map).bindPopup('<strong>DESTINO (B):</strong> ' + route.destino.nombre);

            // Polilínea de la ruta
            const lineColor = route.estado === 'retrasada' ? '#dc2626' : '#2563eb';
            const polyline = L.polyline([origen, destino], {
              color: lineColor,
              weight: 5,
              opacity: 0.85,
              dashArray: route.estado === 'retrasada' ? '8, 8' : null
            }).addTo(map);

            // Ajustar vista para encuadrar la ruta completa
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
          }
        </script>
      </body>
      </html>
    `;
  }, [incidentes, rutaSeleccionada]);

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.map}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3a8a" />
            <Text style={styles.loadingText}>Cargando OpenStreetMap...</Text>
          </View>
        )}
      />

      {rutaSeleccionada && (
        <View style={styles.overlayBanner}>
          <Text style={styles.overlayTitle}>Ruta Seleccionada</Text>
          <Text style={styles.overlayRoute}>
            {rutaSeleccionada.origenNombre} → {rutaSeleccionada.destinoNombre}
          </Text>
          <Text style={styles.overlayStatus}>
            Estado: {rutaSeleccionada.estado.toUpperCase()} | Distancia: {rutaSeleccionada.distanciaTotalKm} km
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  overlayBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    padding: 14,
    borderRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  overlayTitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  overlayRoute: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  overlayStatus: {
    fontSize: 12,
    color: '#334155',
    marginTop: 4,
  },
});

import React, { useMemo } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Platform } from 'react-native';
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

          /* Iconos personalizados con clara diferenciación visual */
          .marker-container { display: flex; flex-direction: column; align-items: center; }
          .badge-label {
            font-size: 9px;
            font-weight: 800;
            padding: 2px 5px;
            border-radius: 4px;
            color: #ffffff;
            white-space: nowrap;
            margin-bottom: 2px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          }
          .icon-pin {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.4);
            border: 2px solid #ffffff;
          }

          /* Punto de Salida (Origen / Despacho) */
          .badge-salida { background-color: #16a34a; }
          .pin-salida { background-color: #22c55e; }

          /* Punto de Entrada (Destino / Entrega) */
          .badge-entrada { background-color: #1d4ed8; }
          .pin-entrada { background-color: #3b82f6; }

          /* Icono de Incidente Vial (NO igual al indicador de ruta) */
          .incident-pin-container { display: flex; flex-direction: column; align-items: center; }
          .incident-triangle {
            width: 32px;
            height: 32px;
            background-color: #dc2626;
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 2px;
            box-shadow: 0 2px 6px rgba(220, 38, 38, 0.5);
            animation: pulse-hazard 2s infinite ease-in-out;
          }
          .incident-exclamation {
            color: #ffffff;
            font-weight: 900;
            font-size: 15px;
            font-family: monospace;
          }
          .badge-incidente {
            background-color: #b91c1c;
            color: #ffffff;
            font-size: 8px;
            font-weight: 800;
            padding: 1px 4px;
            border-radius: 3px;
            margin-bottom: 1px;
            white-space: nowrap;
          }

          @keyframes pulse-hazard {
            0% { transform: scale(1); opacity: 0.95; }
            50% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: 0.95; }
          }

          /* Leyenda visual permanente en mapa */
          .map-legend {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255, 255, 255, 0.95);
            padding: 8px 12px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-family: sans-serif;
            font-size: 11px;
            z-index: 1000;
            border: 1px solid #e2e8f0;
          }
          .legend-title { font-weight: bold; margin-bottom: 6px; color: #1e293b; font-size: 11px; }
          .legend-row { display: flex; align-items: center; margin-bottom: 4px; }
          .legend-symbol { margin-right: 6px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="map-legend">
          <div class="legend-title">Convenciones de Ruta</div>
          <div class="legend-row"><span class="legend-symbol">🚩</span> <strong>Punto de Salida</strong> (Origen)</div>
          <div class="legend-row"><span class="legend-symbol">🏁</span> <strong>Punto de Entrada</strong> (Destino)</div>
          <div class="legend-row"><span class="legend-symbol">⚠️</span> <strong>Incidente Vial</strong> (Afectación)</div>
        </div>

        <script>
          const map = L.map('map', { zoomControl: true }).setView([${centerLat}, ${centerLon}], ${initialZoom});

          // Capa oficial de OpenStreetMap
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          const incidents = ${incidentsJson};
          const route = ${routeJson};

          // Icono distintivo para Incidentes Viales (Triangulo de peligro rojo/alerta)
          const createIncidentIcon = (gravedad) => {
            const colorClass = gravedad === 'critica' ? 'badge-critica' : (gravedad === 'alta' ? 'badge-alta' : 'badge-media');
            return L.divIcon({
              className: 'custom-leaflet-icon',
              html: \`
                <div class="incident-pin-container">
                  <div class="badge-incidente \${colorClass}">⚠️ INCIDENTE</div>
                  <div class="incident-triangle">
                    <span class="incident-exclamation">!</span>
                  </div>
                </div>
              \`,
              iconSize: [60, 48],
              iconAnchor: [30, 48],
              popupAnchor: [0, -48]
            });
          };

          // Renderizar incidentes viales de INVIAS con icono de peligro distintivo
          incidents.forEach(inc => {
            const circleColor = inc.gravedad === 'critica' ? '#dc2626' : (inc.gravedad === 'alta' ? '#ea580c' : '#d97706');
            
            // Radio de afectación en carretera
            L.circle([inc.lat, inc.lon], {
              radius: (inc.radio || 1) * 1000,
              color: circleColor,
              fillColor: circleColor,
              fillOpacity: 0.25
            }).addTo(map);

            // Marcador con popup interactivo e icono propio
            const popupContent = \`
              <div class="custom-popup">
                <div style="font-weight: 800; color: #b91c1c; margin-bottom: 4px;">⚠️ ALERTA DE INCIDENTE VIAL</div>
                <span class="badge badge-\${inc.gravedad}">\${inc.tipo.toUpperCase()}</span>
                <div><strong>Vía:</strong> \${inc.via}</div>
                <div><strong>Detalle:</strong> \${inc.descripcion}</div>
                <div><em>Retraso Estimado: +\${inc.retraso} min</em></div>
              </div>
            \`;
            L.marker([inc.lat, inc.lon], { icon: createIncidentIcon(inc.gravedad) })
              .addTo(map)
              .bindPopup(popupContent);
          });

          // Renderizar ruta activa con diferenciación de Salida (Origen) y Entrada (Destino)
          if (route) {
            const origen = [route.origen.lat, route.origen.lon];
            const destino = [route.destino.lat, route.destino.lon];
            const lineColor = route.estado === 'retrasada' ? '#dc2626' : '#2563eb';

            // Marcador de Salida (Origen / Despacho)
            const iconSalida = L.divIcon({
              className: 'custom-leaflet-icon',
              html: \`
                <div class="marker-container">
                  <div class="badge-label badge-salida">🚩 SALIDA</div>
                  <div class="icon-pin pin-salida">↗</div>
                </div>
              \`,
              iconSize: [50, 42],
              iconAnchor: [25, 42],
              popupAnchor: [0, -42]
            });

            // Marcador de Entrada (Destino / Llegada)
            const iconEntrada = L.divIcon({
              className: 'custom-leaflet-icon',
              html: \`
                <div class="marker-container">
                  <div class="badge-label badge-entrada">🏁 ENTRADA</div>
                  <div class="icon-pin pin-entrada">✓</div>
                </div>
              \`,
              iconSize: [50, 42],
              iconAnchor: [25, 42],
              popupAnchor: [0, -42]
            });

            L.marker(origen, { icon: iconSalida })
              .addTo(map)
              .bindPopup('<strong>🚩 PUNTO DE SALIDA (ORIGEN):</strong><br/>' + route.origen.nombre);

            L.marker(destino, { icon: iconEntrada })
              .addTo(map)
              .bindPopup('<strong>🏁 PUNTO DE ENTRADA (DESTINO):</strong><br/>' + route.destino.nombre);

            // Consultar geometría vial real en carreteras con OSRM
            const osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' +
              route.origen.lon + ',' + route.origen.lat + ';' +
              route.destino.lon + ',' + route.destino.lat + '?overview=full&geometries=geojson';

            fetch(osrmUrl)
              .then(function(res) { return res.json(); })
              .then(function(data) {
                if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
                  const roadLayer = L.geoJSON(data.routes[0].geometry, {
                    style: {
                      color: lineColor,
                      weight: 5,
                      opacity: 0.85,
                      dashArray: route.estado === 'retrasada' ? '8, 8' : null
                    }
                  }).addTo(map);
                  map.fitBounds(roadLayer.getBounds(), { padding: [50, 50] });
                } else {
                  throw new Error('Sin trazado OSRM');
                }
              })
              .catch(function() {
                // Fallback línea directa si OSRM no responde
                const fallbackLine = L.polyline([origen, destino], {
                  color: lineColor,
                  weight: 5,
                  opacity: 0.85,
                  dashArray: route.estado === 'retrasada' ? '8, 8' : null
                }).addTo(map);
                map.fitBounds(fallbackLine.getBounds(), { padding: [50, 50] });
              });
          }
        </script>
      </body>
      </html>
    `;
  }, [incidentes, rutaSeleccionada]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          title="OpenStreetMap"
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      ) : (
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
      )}

      {rutaSeleccionada && (
        <View style={styles.overlayBanner}>
          <Text style={styles.overlayTitle}>Ruta de Transporte Seleccionada</Text>
          
          <View style={styles.pointsContainer}>
            <View style={styles.pointRowOverlay}>
              <View style={[styles.badgePoint, styles.badgePointSalida]}>
                <Text style={styles.badgePointTextSalida}>SALIDA</Text>
              </View>
              <Text style={styles.pointNameOverlay} numberOfLines={1}>
                {rutaSeleccionada.origenNombre}
              </Text>
            </View>

            <View style={styles.pointRowOverlay}>
              <View style={[styles.badgePoint, styles.badgePointEntrada]}>
                <Text style={styles.badgePointTextEntrada}>ENTRADA</Text>
              </View>
              <Text style={styles.pointNameOverlay} numberOfLines={1}>
                {rutaSeleccionada.destinoNombre}
              </Text>
            </View>
          </View>

          <Text style={styles.overlayStatus}>
            Estado: {rutaSeleccionada.estado.toUpperCase()} | Distancia: {rutaSeleccionada.distanciaTotalKm} km | Base: {rutaSeleccionada.tiempoEstimadoBaseMin} min
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
    padding: 12,
    borderRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  overlayTitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pointsContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  pointRowOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePoint: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 6,
  },
  badgePointSalida: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  badgePointEntrada: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  badgePointTextSalida: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803d',
  },
  badgePointTextEntrada: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  pointNameOverlay: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  overlayStatus: {
    fontSize: 11,
    color: '#475569',
    marginTop: 6,
    fontWeight: '500',
  },
});

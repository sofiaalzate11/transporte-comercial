import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { SQLiteDataSource } from '../datasources/sqlite.datasource';
import { ApiDataSource } from '../datasources/api.datasource';

export const LOCATION_TASK_NAME = 'background-location-task';

const sqliteDs = new SQLiteDataSource();
const apiDs = new ApiDataSource();

// Tarea en segundo plano para registrar puntos GPS sin drenar la batería
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('Error en tarea de telemetría de fondo:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      await sqliteDs.addTelemetryPoint(
        'current-active-route', // ID de ruta activa en caché
        location.coords.latitude,
        location.coords.longitude,
        location.coords.speed ? location.coords.speed * 3.6 : undefined,
        location.coords.altitude || undefined,
      );

      // Intentar sincronización oportunista de puntos acumulados
      const pending = await sqliteDs.getUnsyncedTelemetry(25);
      if (pending.length > 0) {
        try {
          await apiDs.sendTelemetryBatch({
            routeId: pending[0].ruta_id,
            points: pending.map((p) => ({
              latitude: p.latitud,
              longitude: p.longitud,
              speedKmh: p.velocidad_kmh,
              altitude: p.altitud,
              batteryLevel: p.bateria_nivel,
              capturedAt: p.timestamp_captura,
            })),
          });

          await sqliteDs.markTelemetrySynced(pending.map((p) => p.id));
        } catch {
          // Si no hay señal celular en cordillera, permanecen en SQLite
        }
      }
    }
  }
});

export async function startBackgroundTelemetry(): Promise<void> {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') return;

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') return;

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 30000, // Cada 30 segundos para proteger batería
    distanceInterval: 100, // O cada 100 metros recorridos
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Transporte Colombia - Monitoreo Activo',
      notificationBody: 'Registrando telemetría y novedades viales en carretera.',
      notificationColor: '#1e3a8a',
    },
  });
}

export async function stopBackgroundTelemetry(): Promise<void> {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}

# Plan de Trabajo Semanal y Backlog Técnico: Sistema de Transporte Colombia

Este documento define la planificación operativa del sprint semanal para los cuatro integrantes del equipo, alineado con sus respectivas ramas y módulos asignados.

---

## 1. Matriz de Asignación por Integrante

| Integrante | Rama Git | Módulo Asignado | Meta Principal del Sprint |
| :--- | :--- | :--- | :--- |
| **Sofia Alzate** | `Sofia` | `shared/types`, `docs/`, Especificación | Definir contratos de ruta OSRM, telemetría y bitácora técnica de integración. |
| **Carlos** | `Carlos` | Backend NestJS, TypeORM, Swagger, PostgreSQL | Endpoints de trazado real GeoJSON, sincronización INVIAS y ciclo de viaje. |
| **Isabella** | `Isabella` | Dominio puro (`src/domain/`), SQLite (`src/data/`) | Tarea en segundo plano para captura GPS y persistencia offline de rutas. |
| **Duber** | `Duber` | Vistas Expo Router v4, UI (`src/presentation/`) | Solución a teclado en login, trazado vial OSRM en mapa y selector de viaje. |

---

## 2. Tareas Detalladas por Integrante

### Sofia Alzate (Rama: `Sofia`)
* **Tarea SOF-01: Especificación de Contratos de Ruta GeoJSON**
  * Definir interfaces TypeScript en `shared/types/index.ts` para representar la geometría vehicular detallada (LineString GeoJSON) y waypoints intermedios.
* **Tarea SOF-02: Esquema de Telemetría GPS en Tránsito**
  * Estandarizar la interfaz `ITelemetryPoint` agregando campos: `precisionMetros`, `rumboGrados`, `bateriaPorcentaje` y `altitud`.
* **Tarea SOF-03: Actualización de la Guía de API y Diagramas C4**
  * Documentar en `docs/` el flujo de sincronización Offline-First y el modelo de estados de viaje (`pendiente` -> `en_transito` -> `completada` -> `cancelada`).

---

### Carlos (Rama: `Carlos`)
* **Tarea CAR-01: Integración del Servicio de Ruteo OSRM en Backend**
  * Implementar endpoint `GET /routes/:id/geometry` que consulte OSRM (`router.project-osrm.org`) y devuelva la geometría vial real de las carreteras colombianas en formato GeoJSON.
* **Tarea CAR-02: Ciclo de Vida del Viaje (Cambio de Estado)**
  * Crear endpoint `PATCH /routes/:id/status` para transiciones de viaje (`en_transito`, `completada`).
  * Validar pertenencia del usuario conductor autenticado mediante JWT.
* **Tarea CAR-03: Sincronizador de Novedades INVIAS #767**
  * Poblar tabla `incidentes_viales` con incidentes vigentes sobre los corredores troncales principales (Ruta 40 Bogotá–Buenaventura y Ruta 25 Medellín–Cali).

---

### Isabella (Rama: `Isabella`)
* **Tarea ISA-01: Servicio de Telemetría en Segundo Plano con Expo**
  * Implementar tarea `BACKGROUND_LOCATION_TASK` en `src/data/services/telemetry-sync.service.ts` usando `expo-location` y `expo-task-manager`.
  * Grabar lecturas GPS en la tabla SQLite local `telemetria_puntos` cuando no haya conectividad.
* **Tarea ISA-02: Flush y Despacho de Buffer de Telemetría**
  * Implementar caso de uso `SyncTelemetryUseCase` que vacíe los puntos acumulados en SQLite enviándolos en lote a `POST /telemetry/batch` al recuperar red.
* **Tarea ISA-03: Cálculo de Retraso Local Geodésico con Turf.js**
  * Refactorizar `CalculateDelayUseCase` para verificar proximidad geométrica de incidentes respecto a la ruta mediante `@turf/point-to-line-distance`.

---

### Duber (Rama: `Duber`)
* **Tarea DUB-01: Corrección de Teclado en Pantalla de Login**
  * Envolver el formulario de [app/(auth)/login.tsx](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/app/(auth)/login.tsx) en `KeyboardAvoidingView` y `ScrollView` con `keyboardShouldPersistTaps="handled"`.
* **Tarea DUB-02: Trazado Vial Curvilíneo en OpenStreetMap (Leaflet)**
  * Modificar [app/(tabs)/mapa.tsx](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/app/(tabs)/mapa.tsx) para renderizar la polilínea OSRM siguiendo las carreteras en lugar de trazo recto.
* **Tarea DUB-03: Panel de Control de Conducción en Ruta**
  * Agregar controles visuales en la tarjeta de ruta para iniciar viaje, ver cronograma y acceder directamente a navegación en mapa.

---

## 3. Cronograma de Integración Semanal

```
Día 1 - 2: Contratos de Sofia (shared/types) y Endpoints de Carlos (Backend OSRM/Status).
Día 3 - 4: Lógica de GPS offline de Isabella (SQLite) y UI de Login/Mapa de Duber (Mobile).
Día 5: Pruebas cruzadas e integración en ramas con validación de lint y build.
```

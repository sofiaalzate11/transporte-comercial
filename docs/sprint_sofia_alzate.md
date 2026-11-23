# Plan de Trabajo Individual: Sofia Alzate (Rama `Sofia`)

Este documento contiene las tareas asignadas para llevar a producción los contratos de datos, la experiencia de usuario del rol cliente y la suite de pruebas del sistema.

---

## 1. Credenciales de Prueba para Verificación

| Rol a Probar | Usuario | Contraseña | Comportamiento Esperado |
| :--- | :--- | :--- | :--- |
| **Cliente / Consulta** | `cliente@transporte.com` | `Prueba123!` | Visualización de remesas, buscador de manifiestos y cálculo de retrasos. |
| **Operador Central** | `operador@transporte.com` | `Prueba123!` | Crear despachos y verificar visibilidad del cliente. |
| **Conductor** | `conductor@transporte.com` | `Prueba123!` | Ejecutar viaje asignado para verificar reflejo en cliente. |

---

## 2. Tareas Asignadas Paso a Paso

### Tarea SOF-01: Especificación de Contratos para Reporte de Novedades y Auditoría
* **Objetivo:** Definir las interfaces TypeScript para el reporte en vía y la trazabilidad de eventos.
* **Archivo:** `transporte_colombia_front/src/shared/types/index.ts`.
* **Pasos:**
  1. Abrir `src/shared/types/index.ts`.
  2. Agregar al final del archivo las siguientes definiciones:
     ```typescript
     /**
      * Motivos válidos de suspensión temporal del transporte en carretera
      */
     export enum RouteSuspensionReason {
       LANDSLIDE = 'derrumbe_bloqueo',
       MECHANICAL_FAILURE = 'falla_mecanica',
       POLICE_CHECKPOINT = 'control_autoridades',
       MANDATORY_REST = 'descanso_reglamentario',
       WEATHER_HAZARD = 'clima_adverso',
     }

     /**
      * Evento de auditoría y trazabilidad histórica del viaje
      */
     export interface IRouteAuditEvent {
       id: string;
       routeId: string;
       estadoAnterior: RouteStatus;
       estadoNuevo: RouteStatus;
       motivo?: string;
       latitud?: number;
       longitud?: number;
       registradoEn: string;
     }

     /**
      * Estructura de consulta de tracking público para clientes
      */
     export interface ITrackingPublicoResult {
       codigoManifiesto: string;
       origenNombre: string;
       destinoNombre: string;
       estado: RouteStatus;
       etaPactado: string;
       etaRecalculado?: string;
       minutosRetraso: number;
       incidentesEnRuta: number;
       conductorNombre: string;
       ultimaActualizacion: string;
     }
     ```
  3. Guardar el archivo.
* **Comando de verificación:**
  ```bash
  npm run lint
  ```

---

### Tarea SOF-02: Vista de Seguimiento para Clientes (`cliente.tsx`)
* **Objetivo:** Crear una pantalla donde el cliente consulte el estado de su carga por código de manifiesto.
* **Archivo a crear:** `transporte_colombia_front/src/presentation/components/TrackingClienteModal.tsx`.
* **Pasos:**
  1. Crear el componente con un campo de búsqueda por texto (`MAN-XXXXX`).
  2. Si el código coincide con una ruta existente, desplegar:
     * Origen (Salida) y Destino (Entrada).
     * Estado del envío (`EN RUTA`, `COMPLETADA`, `SUSPENDIDA`).
     * Hora estimada de entrega original y recalcula.
     * Alerta visual clara si hay derrumbes o cierres viales afectando la remesa.
* **Comando de verificación:** Ejecutar `npm run lint` para garantizar tipado estricto.

---

### Tarea SOF-03: Manual de Aceptación y Checklist QA por Roles
* **Objetivo:** Documentar los casos de prueba de aceptación para validar el sistema antes del despliegue.
* **Archivo a crear:** `transporte_colombia_front/docs/manual_qa_aceptacion.md`.
* **Contenido obligatorio:**
  1. **Matriz de permisos:** Validar que el rol `consulta` no pueda crear rutas ni cambiar estados.
  2. **Regla de oro:** Validar que si `conductor@transporte.com` tiene un viaje activo, la interfaz no permita iniciar otro.
  3. **Caso Offline:** Desconectar internet en el navegador (Modo Offline en DevTools) y verificar que las rutas guardadas en `AsyncStorage` siguen visibles.

---

## 3. Verificación y Entrega

```bash
# 1. Asegurar no romper la compilación
npm run lint

# 2. Confirmar cambios en rama propia
git add .
git commit -m "feat(types-qa): contratos de tracking y modulo de cliente"
git push origin Sofia
```

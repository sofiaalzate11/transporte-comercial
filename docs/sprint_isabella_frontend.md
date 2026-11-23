# Plan de Trabajo Individual: Isabella (Rama `Isabella`)

Este documento detalla las tareas asignadas en el frontend móvil (`transporte_colombia_front`) enfocadas en resiliencia offline, utilidades de interfaz y el flujo de suspensión justificada para conductores.

---

## 1. Credenciales de Prueba para Verificación

| Rol a Probar | Correo de Acceso | Contraseña | Objetivo de Prueba |
| :--- | :--- | :--- | :--- |
| **Conductor** | `conductor@transporte.com` | `Prueba123!` | Probar botones de viaje, suspensión justificada y persistencia offline. |
| **Operador** | `operador@transporte.com` | `Prueba123!` | Comprobar recepción del estado y motivo de suspensión. |

---

## 2. Tareas Asignadas Paso a Paso

### Tarea ISA-01: Módulo de Formateadores Viales (`formatters.ts`)
* **Objetivo:** Estandarizar la visualización de distancias, tiempos y fechas en toda la aplicación.
* **Archivo a crear:** `transporte_colombia_front/src/shared/utils/formatters.ts`.
* **Pasos:**
  1. Crear `src/shared/utils/formatters.ts`.
  2. Implementar las funciones de formato:
     ```typescript
     /**
      * Formatea kilómetros a un decimal exacto (ej: 135.5 km)
      */
     export function formatearKm(distanciaKm: number): string {
       if (isNaN(distanciaKm) || distanciaKm < 0) return '0.0 km';
       return `${distanciaKm.toFixed(1)} km`;
     }

     /**
      * Convierte minutos a formato horas/minutos (ej: 180 min -> 3h 0m)
      */
     export function formatearMinutos(minutos: number): string {
       if (isNaN(minutos) || minutos <= 0) return '0 min';
       const h = Math.floor(minutos / 60);
       const m = Math.round(minutos % 60);
       return h > 0 ? `${h}h ${m}m` : `${m} min`;
     }

     /**
      * Formatea hora militar a hora estándar con periodo AM/PM
      */
     export function formatearHoraColombia(fechaIso: string): string {
       try {
         const date = new Date(fechaIso);
         return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
       } catch {
         return '--:--';
       }
     }
     ```
  3. Guardar el archivo.
* **Comando de verificación:** Ejecutar `npm run lint`.

---

### Tarea ISA-02: Modal de Selección de Motivo de Suspensión (`SuspensionModal.tsx`)
* **Objetivo:** Cuando un conductor pulse "Poner en Suspensión", desplegar un modal para que seleccione el motivo antes de enviar la petición.
* **Archivo a crear:** `transporte_colombia_front/src/presentation/components/SuspensionModal.tsx`.
* **Opciones a desplegar en el modal:**
  * 🚧 Derrumbe / Cierre de vía.
  * 🔧 Falla mecánica del camión.
  * 👮 Control de autoridades / Retén policial.
  * 🛌 Descanso reglamentario obligatorio.
  * 🌧️ Condiciones climáticas adversas (neblina / lluvia torrencial).
* **Comportamiento:**
  * Al elegir una opción y pulsar "Confirmar Suspensión", invocar la actualización de estado a `en_suspension`.
* **Comando de verificación:** Ejecutar `npm run lint`.

---

### Tarea ISA-03: Limpieza Integral de Almacenamiento Local en Logout
* **Objetivo:** Garantizar que al cerrar sesión no queden registros en `AsyncStorage` de la sesión anterior.
* **Archivo a modificar:** `transporte_colombia_front/src/data/services/auth.storage.ts`.
* **Pasos:**
  1. Abrir `src/data/services/auth.storage.ts`.
  2. En la función `borrarSesion()`, asegurar que se borren tanto las credenciales seguras como los datos cacheados:
     ```typescript
     export async function borrarSesion(): Promise<void> {
       await Promise.all([
         deleteSecureItem(SESION_KEY),
         deleteSecureItem(TOKEN_KEY),
         deleteSecureItem(USER_KEY),
       ]);
       try {
         const AsyncStorage = require('@react-native-async-storage/async-storage').default;
         await AsyncStorage.multiRemove(['@web_routes', '@web_incidents']);
       } catch {}
     }
     ```
* **Comando de verificación:** Ejecutar `npm run lint`.

---

## 3. Verificación y Entrega

```bash
# 1. Asegurar cero errores de TypeScript
npm run lint

# 2. Confirmar cambios en rama propia
git add .
git commit -m "feat(offline-ui): formateadores viales y modal de suspension justificada"
git push origin Isabella
```

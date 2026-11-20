# Daily y Plan de Trabajo Detallado: Sistema de Transporte Colombia

Este documento contiene la planificación operativa y el desglose de tareas paso a paso para cada integrante del equipo, indicando archivos exactos, código sugerido y comandos de verificación. La asignación de **Duber** se mantiene como fue definida.

---

## 1. Matriz General de Asignación por Integrante

| Integrante | Rama Git | Módulo Asignado | Enfoque Principal |
| :--- | :--- | :--- | :--- |
| **Sofia Alzate** | `Sofia` | `shared/types`, `docs/`, QA Funcional | Documentación de tipos, checklist de pruebas por rol y catálogo vial. |
| **Carlos** | `Carlos` | Backend NestJS, Swagger, Seeds | Endpoint de salud, sembrado de incidentes de prueba y textos Swagger. |
| **Isabella** | `Isabella` | Frontend Helpers, Almacenamiento | Utilidades de formateo vial, limpieza de caché y mensajes amigables. |
| **Duber** | `Duber` | Vistas Expo Router v4, UI (`src/presentation/`) | Solución a teclado en login, trazado vial OSRM en mapa y selector de viaje. |

---

## 2. Desglose Específico de Tareas por Integrante

---

### Sofia Alzate (Rama: `Sofia`)

#### Tarea SOF-01: Documentación y Tipado de Reportes de Incidentes
* **Objetivo:** Definir el contrato TypeScript para que conductores puedan reportar un incidente vial desde la carretera.
* **Archivo a modificar:** `src/shared/types/index.ts`.
* **Instrucciones paso a paso:**
  1. Abrir el archivo `src/shared/types/index.ts`.
  2. Ir al final del archivo y agregar la siguiente interfaz comentada con JSDoc:
     ```typescript
     /**
      * Estructura para el reporte manual de novedades viales por parte de conductores u operadores.
      */
     export interface IReporteIncidenteManual {
       viaCodigo: string;          // Ej: "Ruta 40" o "Vía al Llano"
       tipoEvento: IncidentType;   // Seleccionado de la lista de IncidentType
       descripcion: string;        // Explicación breve de la afectación
       latitud: number;            // Coordenada GPS de latitud
       longitud: number;           // Coordenada GPS de longitud
       retrasoEstimadoMin: number; // Tiempo estimado de demora en minutos
     }
     ```
  3. Guardar el archivo.
* **Comando de verificación:** En la terminal de `transporte_colombia_front`:
  ```bash
  npm run lint
  ```
  *(Debe mostrar 0 errores).*

---

#### Tarea SOF-02: Manual de Pruebas y Checklist por Roles (QA Funcional)
* **Objetivo:** Crear una guía paso a paso para que cualquier persona del equipo o evaluador pueda probar la app sin perderse.
* **Archivo a crear:** `transporte_colombia_front/docs/guia_pruebas_roles.md`.
* **Instrucciones paso a paso:**
  1. Crear la carpeta `docs` si no existe y crear el archivo `guia_pruebas_roles.md`.
  2. Redactar el contenido con las siguientes secciones:
     * **Prueba 1: Rol Conductor (`conductor@transporte.com` / `Prueba123!`)**
       * Verificar que aparece la insignia verde "CONDUCTOR".
       * Comprobar que NO aparece el botón de "Despachar Ruta".
       * Iniciar una ruta con "Aceptar e Iniciar Viaje" (badge azul "EN RUTA").
       * Comprobar que las demás rutas quedan bloqueadas con el aviso de viaje en curso.
       * Finalizar la entrega y verificar que se desbloquean las demás rutas.
     * **Prueba 2: Rol Operador (`operador@transporte.com` / `Prueba123!`)**
       * Verificar que aparece la insignia índigo "OPERADOR".
       * Comprobar que aparece el panel morado "Despachar Ruta".
       * Abrir el modal y verificar la lista de conductores con sus estados ("Disponible" o "En Viaje Activo").
       * Despachar una ruta fija y comprobar que aparece inmediatamente en la lista.
     * **Prueba 3: Rol Cliente (`cliente@transporte.com` / `Prueba123!`)**
       * Verificar que aparece la insignia ámbar "CONSULTA".
       * Comprobar que solo tiene permisos de visualización.

---

#### Tarea SOF-03: Catálogo de Vías y Nodos Logísticos de Colombia
* **Objetivo:** Crear un documento de referencia con los principales corredores viales para pruebas de despacho.
* **Archivo a crear:** `transporte_colombia_front/docs/catalogo_vias_colombia.md`.
* **Instrucciones paso a paso:**
  1. Crear el archivo `docs/catalogo_vias_colombia.md`.
  2. Incluir una tabla con los corredores troncales oficiales:
     * Ruta Nacional 40: Bogotá - Girardot - Ibagué - Armenia - Buenaventura.
     * Ruta Nacional 25: Bogotá - La Dorada - Medellín - Cali.
     * Ruta Nacional 50: Bogotá - Manizales.
  3. Indicar para cada ciudad su latitud y longitud aproximada y el tiempo típico de trayecto en camión.

---

### Carlos (Rama: `Carlos`)

#### Tarea CAR-01: Endpoint de Salud y Monitoreo del Servidor (`GET /health`)
* **Objetivo:** Crear una ruta rápida para verificar si el backend y la base de datos están encendidos.
* **Archivo a modificar:** `src/app.controller.ts` en `Transporte-Comercial-BACK`.
* **Instrucciones paso a paso:**
  1. Abrir `src/app.controller.ts`.
  2. Agregar el siguiente método dentro de la clase `AppController`:
     ```typescript
     @Get('health')
     checkHealth() {
       return {
         status: 'ok',
         servicio: 'Transporte Colombia Backend API',
         timestamp: new Date().toISOString(),
         entorno: process.env.NODE_ENV || 'development',
       };
     }
     ```
  3. Guardar el archivo.
* **Comando de verificación:**
  1. Compilar: `npm run build`
  2. Probar en navegador o terminal: `curl http://localhost:3000/health` o abrir en Chrome. Debe responder con el JSON de estado `'ok'`.

---

#### Tarea CAR-02: Semilla de Incidentes Viales de Prueba (Seed Script)
* **Objetivo:** Proporcionar datos de prueba realistas para los corredores colombianos en la base de datos PostgreSQL.
* **Archivo a crear:** `Transporte-Comercial-BACK/src/database/seeds/seed-incidentes.ts`.
* **Instrucciones paso a paso:**
  1. Crear el archivo `seed-incidentes.ts` en `src/database/seeds/`.
  2. Agregar un arreglo con 4 incidentes viales colombianos típicos:
     ```typescript
     export const INCIDENTES_INICIALES = [
       {
         tipoEvento: 'derrumbe',
         gravedad: 'critica',
         descripcion: 'Deslizamiento de tierra en el km 38 paso de La Línea',
         viaCodigo: 'Ruta Nacional 40',
         latitud: 4.4500,
         longitud: -75.6000,
         radioAfectacionKm: 5.0,
         retrasoEstimadoMin: 120,
         fuente: 'INVIAS #767',
         estado: 'activo',
       },
       {
         tipoEvento: 'mantenimiento',
         gravedad: 'media',
         descripcion: 'Repavimentación preventiva sector Silvania',
         viaCodigo: 'Ruta 40 Bogotá-Girardot',
         latitud: 4.4000,
         longitud: -74.3800,
         radioAfectacionKm: 2.0,
         retrasoEstimadoMin: 35,
         fuente: 'Concesión Vía 40',
         estado: 'activo',
       },
     ];
     ```
  3. Documentar en un comentario cómo importar este arreglo en `road-incidents.service.ts` para rellenar la tabla si está vacía.
* **Comando de verificación:** Ejecutar `npm run build` en backend para asegurar que compila sin errores.

---

#### Tarea CAR-03: Auditoría y Mejora de Descripciones Swagger
* **Objetivo:** Mejorar los títulos y resúmenes de la documentación visual de la API.
* **Archivo a modificar:** `src/road-incidents/road-incidents.controller.ts` en `Transporte-Comercial-BACK`.
* **Instrucciones paso a paso:**
  1. Abrir `road-incidents.controller.ts`.
  2. Revisar que cada decorador `@ApiOperation` tenga un `summary` en español claro:
     * En `@Get()`: `@ApiOperation({ summary: 'Listar todos los incidentes viales activos en Colombia' })`
     * En `@Post()`: `@ApiOperation({ summary: 'Registrar un nuevo incidente reportado por INVIAS o conductor' })`
  3. Guardar el archivo y abrir `http://localhost:3000/api/docs` en el navegador para verificar la apariencia.

---

### Isabella (Rama: `Isabella`)

#### Tarea ISA-01: Utilidades de Formateo Vial (`formatters.ts`)
* **Objetivo:** Crear funciones reutilizables para que las distancias, tiempos y pesos se muestren bonitos en las pantallas.
* **Archivo a crear:** `transporte_colombia_front/src/shared/utils/formatters.ts`.
* **Instrucciones paso a paso:**
  1. Crear el archivo `formatters.ts` en `src/shared/utils/`.
  2. Escribir las siguientes funciones con TypeScript:
     ```typescript
     /**
      * Convierte kilómetros numéricos a cadena legible (ej: 135.5 km)
      */
     export function formatearDistanciaKm(km: number): string {
       if (isNaN(km) || km < 0) return '0.0 km';
       return `${km.toFixed(1)} km`;
     }

     /**
      * Convierte minutos a formato de horas y minutos (ej: 150 min -> 2h 30m)
      */
     export function formatearTiempoViaje(minutosTotales: number): string {
       if (isNaN(minutosTotales) || minutosTotales <= 0) return '0 min';
       const horas = Math.floor(minutosTotales / 60);
       const minutos = minutosTotales % 60;
       if (horas === 0) return `${minutos} min`;
       if (minutos === 0) return `${horas} h`;
       return `${horas}h ${minutos}m`;
     }

     /**
      * Formatea una fecha ISO a hora local colombiana (ej: 04:30 PM)
      */
     export function formatearHoraEta(fechaIso: string): string {
       try {
         const date = new Date(fechaIso);
         return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
       } catch {
         return '--:--';
       }
     }
     ```
  3. Guardar el archivo.
* **Comando de verificación:** Ejecutar `npm run lint` en frontend.

---

#### Tarea ISA-02: Limpieza de Almacenamiento Local al Cerrar Sesión
* **Objetivo:** Evitar que al cerrar la sesión de un conductor se queden guardadas en el navegador o teléfono las rutas del usuario anterior.
* **Archivo a modificar:** `transporte_colombia_front/src/data/services/auth.storage.ts`.
* **Instrucciones paso a paso:**
  1. Abrir `src/data/services/auth.storage.ts`.
  2. Localizar la función `borrarSesion()` al final del archivo.
  3. Asegurarse de importar `AsyncStorage` de `@react-native-async-storage/async-storage` si no está.
  4. Modificar la función para que también elimine las llaves de caché `@web_routes` y `@web_incidents`:
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
  5. Guardar el archivo.
* **Comando de verificación:** En la terminal de front: `npm run lint`.

---

#### Tarea ISA-03: Mapeo de Errores Amigables para Conductores en Ruta
* **Objetivo:** Mostrar mensajes comprensibles cuando se cae la red en carretera en vez de códigos de error crudos de Axios.
* **Archivo a crear:** `transporte_colombia_front/src/shared/utils/error-helper.ts`.
* **Instrucciones paso a paso:**
  1. Crear `src/shared/utils/error-helper.ts`.
  2. Implementar una función que traduzca errores comunes:
     ```typescript
     export function obtenerMensajeErrorAmigable(error: any): string {
       if (!error) return 'Ocurrió un error inesperado.';
       const mensaje = error?.response?.data?.message || error?.message || '';

       if (typeof mensaje === 'string') {
         if (mensaje.includes('viaje activo')) {
           return 'Ya tienes una entrega en curso. Debes finalizarla antes de iniciar otra.';
         }
         if (mensaje.includes('Network Error') || mensaje.includes('timeout')) {
           return 'Sin señal de red en carretera. Los datos se guardarán localmente.';
         }
         if (mensaje.includes('401') || mensaje.includes('Unauthorized')) {
           return 'Tu sesión ha expirado. Por favor ingresa nuevamente con tus credenciales.';
         }
         return mensaje;
       }
       return 'No se pudo completar la operación. Verifica tu conexión.';
     }
     ```
  3. Guardar el archivo.
* **Comando de verificación:** Ejecutar `npm run lint` en frontend.

---

### Duber (Rama: `Duber`) *(Sin modificaciones)*

* **Tarea DUB-01: Corrección de Teclado en Pantalla de Login**
  * Envolver el formulario de [app/(auth)/login.tsx](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/app/(auth)/login.tsx) en `KeyboardAvoidingView` y `ScrollView` con `keyboardShouldPersistTaps="handled"`.
* **Tarea DUB-02: Trazado Vial Curvilíneo en OpenStreetMap (Leaflet)**
  * Modificar [app/(tabs)/mapa.tsx](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/app/(tabs)/mapa.tsx) para renderizar la polilínea OSRM siguiendo las carreteras en lugar de trazo recto.
* **Tarea DUB-03: Panel de Control de Conducción en Ruta**
  * Agregar controles visuales en la tarjeta de ruta para iniciar viaje, ver cronograma y acceder directamente a navegación en mapa.

---

## 3. Flujo de Trabajo Recomendado para el Equipo

```
1. Actualizar repositorio: git pull origin <mi-rama>
2. Realizar un solo cambio a la vez siguiendo las instrucciones del archivo.
3. Guardar y verificar con: npm run lint (en front) o npm run build (en back).
4. Si pasa con 0 errores:
   git add .
   git commit -m "feat(modulo): descripcion corta de lo realizado"
   git push origin <mi-rama>
5. Si sale error: no modificar otros archivos; avisar a Duber para revisión.
```

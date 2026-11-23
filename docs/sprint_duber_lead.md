# Plan de Trabajo Individual: Duber (Rama `Duber`)

Este documento consolida las responsabilidades de arquitectura frontend, experiencia de usuario y supervisión de integración para llevar la plataforma de transporte a producción.

---

## 1. Credenciales de Prueba Maestras

| Rol de Prueba | Correo de Acceso | Contraseña | Alcance de Validación |
| :--- | :--- | :--- | :--- |
| **Operador Central** | `operador@transporte.com` | `Prueba123!` | Panel de despacho por dirección libre, visualización de flota y cálculo OSRM. |
| **Conductor** | `conductor@transporte.com` | `Prueba123!` | Bloqueo de doble viaje, ciclo de estados y navegación en mapa. |
| **Cliente** | `cliente@transporte.com` | `Prueba123!` | Verificación de solo lectura y cálculo dinámico de ETA. |

---

## 2. Tareas Asignadas Paso a Paso

### Tarea DUB-01: Corrección de Teclado y Scroll en Formularios Móviles
* **Objetivo:** Garantizar que el teclado en Android e iOS nunca oculte los campos de texto ni botones de acción en autenticación y despacho.
* **Archivos:** [AuthScreen.tsx](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/src/presentation/components/ui/AuthScreen.tsx), [rutas.tsx](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/app/(tabs)/rutas.tsx).
* **Alcance:**
  * `KeyboardAvoidingView` ajustado según plataforma (`padding` en iOS, `height` en Android).
  * `ScrollView` con `keyboardShouldPersistTaps="handled"` para permitir pulsar botones sin cerrar el teclado previamente.

---

### Tarea DUB-02: Trazado Vial Curvilíneo OSRM y Diferenciación de Marcadores
* **Objetivo:** Mostrar la geometría real de las carreteras colombianas en OpenStreetMap en vez de líneas rectas.
* **Archivo:** [mapa.tsx](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/app/(tabs)/mapa.tsx).
* **Alcance completado y a mantener:**
  * Integración con API OSRM (`router.project-osrm.org`) renderizando polilíneas GeoJSON.
  * Marcador de **Salida (Origen)** en verde esmeralda con etiqueta superior.
  * Marcador de **Entrada (Destino)** en azul índigo con etiqueta superior.
  * Marcador de **Incidente Vial** exclusivo con triángulo reflectivo animado (`⚠️`), desacoplado de los puntos de ruta.

---

### Tarea DUB-03: Panel de Despacho Libre y Regla de Un Solo Viaje Activo
* **Objetivo:** Permitir al operador digitar cualquier dirección o ciudad colombiana y validar que el conductor no tenga ya un viaje en curso.
* **Archivos:** [rutas.tsx](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/app/(tabs)/rutas.tsx), [RouteCard.tsx](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/src/presentation/components/RouteCard.tsx).
* **Alcance:**
  * Pestaña "Dirección / Ciudad Libre" con georreferenciación y cálculo automático de kilómetros y minutos de viaje.
  * Bloqueo visual e inhabilitación del botón "Aceptar e Iniciar Viaje" si el conductor ya tiene una ruta en `en_ruta` o `en_suspension`.
  * Banner superior en interfaz de conductor recordando finalizar la entrega activa.

---

### Tarea DUB-04: Dashboard de Monitoreo de Flota para Operaciones
* **Objetivo:** Proveer una barra resumen en el panel de operador con estadísticas clave del día.
* **Métricas a mostrar:**
  * Conductores disponibles vs ocupados.
  * Rutas activas en tránsito nacional.
  * Total de incidentes viales activos que generan alertas de retraso.

---

### Tarea DUB-05: Revisión de Código e Integración hacia `main`
* **Objetivo:** Validar y aprobar los Pull Requests de Sofia, Carlos e Isabella antes de la consolidación final.
* **Checklist de revisión:**
  * Verificación de tipado estricto (`npm run lint`).
  * Sin advertencias de compilación ni dependencias circulares.
  * Conservación de la regla de no usar assets PNG/SVG físicos para íconos (uso estricto de `@expo/vector-icons`).

---

## 3. Verificación y Despliegue

```bash
# Validación completa de frontend
npm run lint

# Prueba de build local
npx expo export --platform web

# Sincronización en rama líder
git add .
git commit -m "feat(lead-architecture): panel de despacho, navegacion vial y dashboard operativo"
git push origin Duber
```

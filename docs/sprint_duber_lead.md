# Plan de Trabajo Individual: Duber (Rama `Duber`)

Este documento consolida las 11 tareas de producción bajo el liderazgo de arquitectura frontend, experiencia de usuario y supervisión técnica general del Sistema de Transporte Comercial Colombia.

---

## 1. Credenciales de Prueba Maestras

| Rol de Validación | Correo Electrónico | Contraseña | Enfoque de Pruebas |
| :--- | :--- | :--- | :--- |
| **Operador Central** | `operador@transporte.com` | `Prueba123!` | Torre de control, despacho inteligente por dirección libre y analítica de flota. |
| **Conductor** | `conductor@transporte.com` | `Prueba123!` | Bloqueo de doble viaje, ciclo de vida de ruta y navegación vial en mapa. |
| **Cliente** | `cliente@transporte.com` | `Prueba123!` | Monitoreo en vivo de remesas y recálculo dinámico de hora de entrega. |

---

## 2. Backlog Exhaustivo de Tareas

### Tarea DUB-01: Corrección Integral de Teclado en Formularios Móviles
* **Archivos:** `src/presentation/components/ui/AuthScreen.tsx`, `app/(tabs)/rutas.tsx`.
* **Descripción:** Implementar `KeyboardAvoidingView` adaptativo (`padding` en iOS, `height` en Android) y scroll con cierre de teclado al interactuar, impidiendo que campos de texto queden ocultos en dispositivos de cualquier tamaño de pantalla.

### Tarea DUB-02: Trazado Vial Curvilíneo OSRM y Diferenciación de Marcadores
* **Archivo:** `app/(tabs)/mapa.tsx`.
* **Descripción:** Renderizado en OpenStreetMap con polilíneas OSRM sobre carreteras reales, marcador circular verde esmeralda para **Salida (Origen)**, marcador azul índigo para **Entrada (Destino)** y triángulo de emergencia reflectivo animado (`⚠️`) para incidentes viales.

### Tarea DUB-03: Panel de Despacho Libre y Regla de Un Solo Viaje Activo
* **Archivos:** `app/(tabs)/rutas.tsx`, `src/presentation/components/RouteCard.tsx`.
* **Descripción:** Pestaña "Dirección / Ciudad Libre" con geocodificación automática Nominatim y cálculo vial OSRM. Bloqueo estricto e inhabilitación del botón "Aceptar e Iniciar Viaje" si el conductor ya posee una ruta en curso.

### Tarea DUB-04: Torre de Control Multivehículo en el Mapa
* **Archivo:** `app/(tabs)/mapa.tsx`.
* **Descripción:** Permitir al operador visualizar simultáneamente sobre el mapa de Colombia todos los camiones de la flota que se encuentren en tránsito (`en_ruta`), con su color de estado y datos del conductor en tooltip.

### Tarea DUB-05: Ruteo Alternativo Inteligente por Cierres Viales
* **Archivo:** `src/domain/use-cases/calculate-alternate-route.usecase.ts`.
* **Descripción:** En caso de que un incidente presente gravedad crítica con cierre total de vía (ej: Paso de La Línea), calcular automáticamente un corredor alterno (ej: Alto de Letras) y presentar al operador la comparativa de tiempo adicional y kilometraje.

### Tarea DUB-06: Dashboard de Indicadores de Rendimiento y Puntualidad (OTIF)
* **Archivo:** `src/presentation/components/FleetAnalyticsDashboard.tsx`.
* **Descripción:** Panel analítico para la central de despacho con gráficos de porcentaje de entregas a tiempo (On-Time In-Full), número de alertas viales activas y relación de conductores ocupados vs disponibles.

### Tarea DUB-07: Modo Nocturno de Cabina para Conductores
* **Archivo:** `src/presentation/theme/cabina-dark-theme.ts`.
* **Descripción:** Tema de alto contraste con fondo negro (#000000) y tonos ámbar suaves para visualización nocturna en cabina, evitando encandilar al transportador durante trayectos de madrugada.

### Tarea DUB-08: Tarjeta de Ruta Enriquecida con Desglose Vial
* **Archivo:** `src/presentation/components/RouteCard.tsx`.
* **Descripción:** Presentar en la tarjeta de ruta: costo estimado de peajes, horas de conducción reglamentaria, nombre del conductor asignado y botón de navegación en mapa.

### Tarea DUB-09: Sistema de Notificaciones de Asignación y Alertas
* **Archivo:** `src/data/services/notifications.service.ts`.
* **Descripción:** Configurar `expo-notifications` para emitir avisos sonoros y en barra de estado cuando la central de despacho asigne una nueva remesa al conductor.

### Tarea DUB-10: Optimización de Rendimiento y Empaquetado Multiplataforma
* **Archivos:** `app.json`, `metro.config.js`.
* **Descripción:** Tree-shaking de paquetes pesados, optimización de bundles para Web y configuración de parámetros nativos para generación de APK en Android con Expo Application Services (EAS).

### Tarea DUB-11: Revisión Técnica y Fusión de Pull Requests hacia `main`
* **Descripción:** Supervisión del código de los integrantes del equipo, validando que se mantenga la política de cero assets físicos (uso exclusivo de `@expo/vector-icons`), tipado estricto y ausencia de advertencias antes del merge a la rama principal.

---

## 3. Comandos de Verificación y Compilación

```bash
# Verificación estricta de código
npm run lint

# Prueba de compilación estática web
npx expo export --platform web

# Sincronización en rama líder
git add .
git commit -m "feat(lead-architecture): backlog completo de produccion y torre de control"
git push origin Duber
```

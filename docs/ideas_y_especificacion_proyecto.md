# Documento Maestro: Monitoreo Vial y Retrasos de Transporte (Colombia)

## 1. Alcance Funcional e Ideas del Sistema

* Registro e inicio de sesión por roles: conductor, operador y cliente.
* Consulta de estado vial en tiempo real con datos de INVIAS #767.
* Visualización cartográfica de incidentes: cierres totales, pasos a un carril y derrumbes.
* Registro continuo de telemetría GPS en segundo plano con bajo consumo.
* Almacenamiento local persistente para operar en zonas sin cobertura celular.
* Sincronización asíncrona bidireccional al recuperar señal móvil.
* Motor analítico para calcular retrasos respecto al horario pactado.

---

## 2. Pila Tecnológica Exhaustiva para el IDE

### Frameworks Principales
* **React Native 0.76+:** Motor móvil con New Architecture, Fabric y Bridgeless.
* **Expo SDK 52+:** Toolchain principal con Continuous Native Generation y Development Builds.
* **expo-router v4:** Enrutamiento declarativo por carpetas en `app/`.

### Lenguaje y Tipado
* **TypeScript 5.x:** Modo estricto activado en `tsconfig.json`.
* **Path Aliases:** Mapeo de rutas `@domain/*`, `@data/*`, `@presentation/*`, `@core/*`.

### Persistencia y Seguridad
* **expo-sqlite:** Motor relacional embebido local para estrategia Offline-First.
* **expo-secure-store:** Cifrado de credenciales en Android Keystore e iOS Keychain.

### Sensores y Tareas en Segundo Plano
* **expo-location:** Proveedor de localización combinada GNSS, WiFi y celular.
* **expo-task-manager:** Ejecutor de tareas registradas ante el kernel del SO.
* **expo-background-fetch:** Sincronización periódica en segundo plano.

### Cartografía y Algoritmia Espacial
* **@maplibre/maplibre-react-native:** Renderizador de mapas vectoriales con GPU y caché MBTiles.
* **@turf/turf:** Módulos de distancia geodésica, buffers y colisiones espaciales sobre WGS84.

### Manejo de Estado y Red
* **zustand:** Estado global síncrono para usuario y ruta activa.
* **@tanstack/react-query v5:** Gestión asíncrona de caché, reintentos y mutaciones.
* **@react-native-community/netinfo:** Detección de conectividad de interfaces físicas.
* **date-fns:** Manejo determinista de tiempo en zona horaria UTC-5.

### Herramientas de Desarrollo y Calidad (devDependencies)
* **eslint:** Linter de reglas para React Native y TypeScript.
* **prettier:** Formateador automático de código.
* **jest:** Framework de pruebas unitarias.
* **jest-expo:** Configuración predefinida de pruebas para el entorno Expo.
* **@testing-library/react-native:** Pruebas de integración de componentes UI.

---

## 3. Arquitectura de Software por Capas

### Capa 1: Presentación (`app/` y `src/presentation/`)
* Vistas, pantallas, componentes visuales y stores de Zustand.
* Prohibido procesar consultas SQL o cálculos matemáticos en esta capa.

### Capa 2: Lógica de Negocio y Dominio (`src/domain/`)
* Reglas puras de transporte, casos de uso, modelos inmutables y contratos abstractos.
* Código TypeScript puro sin dependencias de React Native ni bases de datos.

### Capa 3: Datos e Infraestructura (`src/data/`)
* Implementación de repositorios, SQLite DDL, adaptadores HTTP y tareas en segundo plano.
* Mapeo de GeoJSON externo hacia entidades limpias de dominio.

---

## 4. Modelo Relacional SQL (SQLite DDL)

```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    documento TEXT NOT NULL UNIQUE,
    rol TEXT CHECK(rol IN ('conductor', 'operador', 'consulta')) DEFAULT 'conductor',
    token_sesion TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rutas_entrega (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    codigo_manifiesto TEXT,
    origen_nombre TEXT NOT NULL,
    origen_lat REAL NOT NULL,
    origen_lon REAL NOT NULL,
    destino_nombre TEXT NOT NULL,
    destino_lat REAL NOT NULL,
    destino_lon REAL NOT NULL,
    eta_pactado DATETIME NOT NULL,
    eta_recalculado DATETIME,
    distancia_total_km REAL NOT NULL,
    tiempo_estimado_base_min INTEGER NOT NULL,
    estado TEXT CHECK(estado IN ('pendiente', 'en_ruta', 'completada', 'retrasada', 'cancelada')) DEFAULT 'pendiente',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tramos_ruta (
    id TEXT PRIMARY KEY,
    ruta_id TEXT NOT NULL,
    orden_secuencia INTEGER NOT NULL,
    origen_segmento_lat REAL NOT NULL,
    origen_segmento_lon REAL NOT NULL,
    destino_segmento_lat REAL NOT NULL,
    destino_segmento_lon REAL NOT NULL,
    via_codigo TEXT,
    distancia_km REAL NOT NULL,
    tiempo_base_min INTEGER NOT NULL,
    FOREIGN KEY (ruta_id) REFERENCES rutas_entrega(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS incidentes_viales (
    id TEXT PRIMARY KEY,
    id_fuente_externa TEXT,
    tipo_evento TEXT CHECK(tipo_evento IN ('cierre_total', 'paso_a_un_carril', 'derrumbe', 'mantenimiento', 'accidente', 'clima', 'manifestacion')) NOT NULL,
    gravedad TEXT CHECK(gravedad IN ('baja', 'media', 'alta', 'critica')) NOT NULL,
    descripcion TEXT,
    via_codigo TEXT,
    ubicacion_lat REAL NOT NULL,
    ubicacion_lon REAL NOT NULL,
    radio_afectacion_km REAL DEFAULT 1.0,
    retraso_estimado_min INTEGER DEFAULT 0,
    fuente TEXT NOT NULL,
    estado TEXT CHECK(estado IN ('activo', 'resuelto', 'verificado')) DEFAULT 'activo',
    fecha_reporte DATETIME NOT NULL,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telemetria_puntos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ruta_id TEXT NOT NULL,
    latitud REAL NOT NULL,
    longitud REAL NOT NULL,
    velocidad_kmh REAL,
    altitud REAL,
    bateria_nivel REAL,
    timestamp_captura DATETIME NOT NULL,
    sincronizado INTEGER DEFAULT 0,
    FOREIGN KEY (ruta_id) REFERENCES rutas_entrega(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evaluaciones_retraso (
    id TEXT PRIMARY KEY,
    ruta_id TEXT NOT NULL,
    incidente_id TEXT,
    retraso_delta_min INTEGER NOT NULL,
    causa_principal TEXT NOT NULL,
    timestamp_calculo DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ruta_id) REFERENCES rutas_entrega(id) ON DELETE CASCADE,
    FOREIGN KEY (incidente_id) REFERENCES incidentes_viales(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetria_sync ON telemetria_puntos(ruta_id, sincronizado);
CREATE INDEX IF NOT EXISTS idx_incidentes_espacial ON incidentes_viales(ubicacion_lat, ubicacion_lon, estado);
CREATE INDEX IF NOT EXISTS idx_tramos_orden ON tramos_ruta(ruta_id, orden_secuencia);
CREATE INDEX IF NOT EXISTS idx_rutas_estado ON rutas_entrega(usuario_id, estado);
```

---

## 5. Fuentes de Datos y APIs Viales de Colombia

* **Datos Abiertos Colombia (`datos.gov.co`):** API SODA para inventario vial y peajes.
* **Geoportal INVIAS / HERMES (`hermes.invias.gov.co`):** Novedades oficiales del programa #767.
* **IDEAM:** Alertas climáticas y riesgo por deslizamientos de tierra.
* **OpenStreetMap / OSRM:** Enrutamiento base y topología vial sin costo comercial.
* **TomTom Traffic API:** Velocidades de flujo y congestión en tiempo real.

---

## 6. Algoritmo de Retraso

$$\text{ETA}_{\text{recalculado}} = \text{Tiempo}_{\text{actual}} + \sum_{i=1}^{n} T_{\text{tramo}_i} + \sum_{j=1}^{m} D_{\text{incidente}_j}$$

$$\Delta T = \text{ETA}_{\text{recalculado}} - \text{ETA}_{\text{pactado}}$$

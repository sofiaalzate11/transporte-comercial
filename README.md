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

## 2. Arquitectura de Software por Capas

### Capa 1: Presentación
* Maneja la interacción con el usuario y renderizado de componentes.
* Utiliza enrutamiento declarativo y estado global reactivo en memoria.
* Prohibido procesar consultas SQL o cálculos matemáticos en esta capa.

### Capa 2: Lógica de Negocio y Dominio
* Contiene reglas puras de transporte y algoritmos de demoras.
* Independiente de librerías de interfaz gráfica y motores de base de datos.
* Aplica cálculo geodésico sobre coordenadas bajo el elipsoide WGS84.

### Capa 3: Datos e Infraestructura
* Gestiona base de datos SQLite local bajo esquema relacional.
* Almacena tokens de sesión cifrados en hardware con Keystore y Keychain.
* Consume endpoints HTTP de datos abiertos gubernamentales y servicios REST.

---

## 3. Modelo Relacional SQL (SQLite DDL)

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

## 4. Dependencias Oficiales Vigentes

* `expo`: Versión SDK actual para generación de compilación nativa.
* `expo-router`: Sistema declarativo de rutas y control de sesión.
* `expo-sqlite`: Motor de base de datos relacional transaccional local.
* `expo-secure-store`: Cifrado por hardware en Keystore y Keychain.
* `expo-location`: Captura de posición mediante fusión de sensores GNSS.
* `expo-task-manager`: Manejo de servicios nativos en segundo plano.
* `@maplibre/maplibre-react-native`: Renderizado de mapas vectoriales con caché.
* `@turf/turf`: Geometría computacional para cálculo geodésico y radios.
* `zustand`: Gestión de estado global en memoria.
* `@tanstack/react-query`: Control de estados asíncronos y caché de red.
* `@react-native-community/netinfo`: Monitoreo de conectividad a internet.
* `date-fns`: Operaciones deterministas con marcas de tiempo en UTC-5.

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

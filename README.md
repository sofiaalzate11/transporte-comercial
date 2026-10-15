# Transporte Comercial Colombia (React Native & Expo)

Aplicación móvil orientada a transportadores de carga y comercio en Colombia con arquitectura **Offline-First**, gestión de incidencias viales en tiempo real y cálculo de peajes.

---

## 🚀 Stack Tecnológico

- **Framework:** React Native 0.76+ con Nueva Arquitectura Bridgeless habilitada.
- **Toolchain:** Expo SDK 52+ (*Development Builds*).
- **Enrutamiento:** `expo-router` v4 basado en el sistema de archivos (`app/`).
- **Base de Datos Local:** `expo-sqlite` (modo WAL con transacciones ACID).
- **Seguridad:** `expo-secure-store` (Android Keystore / iOS Keychain).
- **Estado Global:** Zustand (sesión y filtros) + TanStack Query v5 (caché asíncrono y red).
- **Manejo de Fechas:** `date-fns` en zona horaria UTC-5 (Colombia).

---

## 🏛️ Clean Architecture (3 Capas)

```text
├── app/                              # Capa de Navegación y Rutas (expo-router v4)
│   ├── _layout.tsx                   # Layout global con QueryClientProvider
│   ├── index.tsx                     # Panel principal de métricas y cierres críticos
│   ├── alerts.tsx                    # Feed interactivo de alertas viales #767
│   └── tolls.tsx                     # Catálogo y cálculo de tarifas de peajes
├── src/
│   ├── domain/                       # Capa 2: Lógica de Negocio Pura (TypeScript)
│   │   ├── models/                   # Entidades (RoadAlert, TollStation)
│   │   ├── repositories/             # Contratos/interfaces (IRoadAlertRepository, ITollStationRepository)
│   │   └── usecases/                 # Casos de uso (GetRoadAlertsUseCase, GetTollStationsUseCase)
│   ├── data/                         # Capa 3: Datos e Infraestructura
│   │   ├── datasources/
│   │   │   ├── local/                # DatabaseManager (SQLite), RoadAlertDao, TollStationDao
│   │   │   └── remote/               # InviasArcGisClient (HERMES), SocrataTollsClient (SODA)
│   │   ├── mappers/                  # RoadAlertMapper, TollStationMapper
│   │   └── repositories/             # Implementaciones de repositorios
│   └── presentation/                 # Capa 1: Presentación y Estado
│       ├── components/               # AlertCard, TollCard
│       ├── hooks/                    # useRoadAlerts, useTollStations (TanStack Query)
│       └── store/                    # useSessionStore, useAlertsStore (Zustand)
```

---

## 📡 Fuentes de Datos Oficiales de Colombia

1. **INVIAS HERMES #767:** ArcGIS FeatureServer REST API para derrumbes y cierres viales.
2. **Datos Abiertos Colombia:** SODA REST API para estaciones de peajes y tarifas por categorías I-V.

---

## 🛠️ Instalación y Ejecución

```bash
# 1. Instalar dependencias del proyecto
npm install

# 2. Iniciar servidor de desarrollo Metro
npm start

# 3. Compilar Development Build nativo en Android
npm run android
```
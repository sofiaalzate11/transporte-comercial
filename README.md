# Sistema de Monitoreo Vial y Control de Retrasos (Transporte Colombia)

Sistema distribuido Offline-First para transporte de carga en corredores viales colombianos. Integra una API REST en NestJS con PostgreSQL/PostGIS y una aplicación móvil en React Native (Expo) con persistencia local SQLite y mapas MapLibre.

---

## 1. Estructura del Monorepo

El repositorio organiza responsabilidades técnicas en cuatro áreas independientes:

```text
transporte_colombia_rn/
├── backend/                  # Servidor API REST en NestJS
│   ├── src/
│   │   ├── auth/             # Autenticación JWT y guards
│   │   ├── users/            # Entidades y gestión de usuarios
│   │   ├── routes/           # Rutas de transporte y tramos viales
│   │   ├── road-incidents/   # Novedades INVIAS y eventos en carretera
│   │   ├── telemetry/        # Ingesta masiva de coordenadas GPS
│   │   ├── delay-engine/     # Algoritmo de cálculo de demoras (Haversine)
│   │   ├── database/         # Configuración TypeORM y PostgreSQL
│   │   └── main.ts           # Bootstrap y Swagger UI (/api/docs)
│   └── package.json
│
├── mobile/                   # Aplicación móvil en React Native (Expo SDK 52)
│   ├── app/                  # Enrutador basado en archivos (expo-router v4)
│   │   ├── (auth)/login.tsx  # Pantalla de acceso
│   │   └── (tabs)/           # Pestañas: Rutas y Mapa Vial
│   ├── src/
│   │   ├── domain/           # Capa 2: Reglas puras y casos de uso
│   │   ├── data/             # Capa 3: Persistencia SQLite y cliente HTTP
│   │   └── presentation/     # Capa 1: Tiendas Zustand y componentes UI
│   └── package.json
│
├── shared/                   # Tipos TypeScript y contratos comunes
│   └── types/index.ts        # Interfaces compartidas cliente-servidor
│
├── docs/                     # Especificaciones técnicas y guías de estudio
├── docker-compose.yml        # PostgreSQL 16 con extensión PostGIS
└── AGENTS.md                 # Directivas del proyecto y reglas de código
```

---

## 2. Arquitectura de Software por Capas

El cliente móvil implementa **Clean Architecture** para desacoplar la lógica de negocio de la interfaz:

* **Capa 1: Presentación (`mobile/app/`, `mobile/src/presentation/`):**
  * Maneja la interacción del usuario y renderizado de componentes.
  * Tiendas reactivas con **Zustand** y gestión asíncrona con **TanStack Query**.
  * Prohibido ejecutar consultas SQL directas o fórmulas matemáticas en esta capa.
* **Capa 2: Lógica de Negocio (`mobile/src/domain/`):**
  * Casos de uso puros en TypeScript (`CalculateDelayUseCase`).
  * Sin dependencias de React Native, APIs externas ni SQLite.
* **Capa 3: Datos e Infraestructura (`mobile/src/data/`):**
  * Persistencia local relacional con **expo-sqlite** bajo modo WAL.
  * Tareas de telemetría GPS en segundo plano con **expo-task-manager**.
  * Clientes HTTP con **Axios** e interceptores de token en **expo-secure-store**.

---

## 3. Modelo de Datos Relacional

### Tablas del Servidor (PostgreSQL / TypeORM)
1. `usuarios`: Identificación, rol (`conductor`, `operador`, `consulta`) y hash de contraseña.
2. `rutas_entrega`: Origen, destino, coordenadas, ETA pactado y estado.
3. `tramos_ruta`: Subtramos secuenciales con distancia en km y tiempo base.
4. `incidentes_viales`: Eventos oficiales (#767) con radio de afectación y minutos de demora.
5. `telemetria_puntos`: Búfer masivo de coordenadas GPS, velocidad y altitud.

### Persistencia Móvil Offline (SQLite)
* La aplicación mantiene réplica local de rutas e incidentes para operar en zonas de cordillera sin cobertura celular.
* Registra puntos GPS en una tabla búfer (`telemetria_buffer`) y los sincroniza automáticamente cuando detecta conexión de red.

---

## 4. Motor Analítico de Retraso Vial

El retraso se evalúa cruzando los tramos viales con los radios de afectación de incidentes activos mediante la **fórmula de Haversine**:

$$\Delta\sigma = 2 \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)} \right)$$

$$d = R \cdot \Delta\sigma \quad (R = 6371\text{ km})$$

Cálculo del retraso acumulado y proyección de llegada:

$$\text{ETA}_{\text{recalculado}} = \text{ETA}_{\text{pactado}} + \sum_{j=1}^{m} D_{\text{incidente}_j}$$

$$\Delta T = \text{ETA}_{\text{recalculado}} - \text{ETA}_{\text{pactado}}$$

---

## 5. Distribución de Ramas y Autoría en Git

El trabajo técnico está distribuido en cuatro ramas para preservar la autoría de cada integrante:

| Integrante | Rama GitHub | Módulo asignado |
| :--- | :--- | :--- |
| **Sofia Alzate** | `Sofia` | Contratos compartidos (`shared/types`), especificaciones y `docs/`. |
| **Carlos** | `Carlos` | Backend NestJS, TypeORM, Swagger y PostgreSQL. |
| **Isabella** | `Isabella` | Capas de dominio puro y persistencia SQLite en cliente móvil. |
| **Duber** | `Duber` | Vistas Expo Router v4, componentes UI y reestructuración general. |

---

## 6. Instrucciones de Ejecución

### Requisitos Previos
* Node.js v20+ o v22+
* PostgreSQL activo en puerto `5432` (nativo de Windows o mediante `docker compose up -d`)

### 1. Iniciar el Backend (NestJS)
```powershell
cd backend
npm install --legacy-peer-deps
npm run start:dev
```
* **API activa en:** `http://localhost:3000`
* **Swagger UI interactivo:** `http://localhost:3000/api/docs`

### 2. Iniciar la Aplicación Móvil (React Native)
```powershell
cd mobile
npm install --legacy-peer-deps
npx expo start
```
* Presiona `a` para emulador de Android o escanea el código QR con Expo Go.

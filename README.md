# Sistema de Monitoreo Vial y Control de Retrasos - Frontend Mobile

Aplicación móvil Offline-First para transporte de carga en corredores viales colombianos. Desarrollada en React Native con Expo SDK 58, persistencia local SQLite y visualización interactiva de mapas viales.

---

## 1. Estructura del Repositorio Frontend

```text
transporte-comercial-front/
├── mobile/                   # Aplicación móvil en React Native (Expo SDK 58)
│   ├── app/                  # Enrutador basado en archivos (expo-router v58)
│   │   ├── (auth)/login.tsx  # Pantalla de acceso
│   │   └── (tabs)/           # Pestañas: Rutas y Mapa Vial
│   ├── src/
│   │   ├── domain/           # Capa 2: Reglas puras y casos de uso
│   │   ├── data/             # Capa 3: Persistencia SQLite y cliente HTTP
│   │   ├── presentation/     # Capa 1: Tiendas Zustand y componentes UI
│   │   └── shared/types/     # Tipos TypeScript y contratos
│   └── package.json
├── shared/                   # Tipos y contratos base
├── docs/                     # Especificaciones técnicas y bitácoras
└── AGENTS.md                 # Directivas del proyecto
```

> **Nota:** El backend NestJS se gestiona de forma desacoplada en el repositorio `Transporte-Comercial-BACK`.

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

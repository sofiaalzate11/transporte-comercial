# Informe Técnico: Puesta en Marcha del Backend y Base de Datos

## 1. Resumen de Operaciones Ejecutadas
Durante esta sesión de trabajo se logró compilar, configurar y ejecutar de forma operativa el backend en **NestJS**, así como preparar las dependencias del cliente móvil en **React Native (Expo)** y aprovisionar la base de datos relacional sin necesidad de requerir virtualización por hardware (Docker).

---

## 2. Fase de Instalación de Dependencias

### 2.1 Backend (`backend/`)
* **Problema detectado:** Conflictos de compatibilidad entre versiones candidatas de `@nestjs/schematics` y versiones de `@nestjs/jwt`.
* **Solución aplicada:**
  * Ajuste de dependencias hacia el ecosistema estable NestJS 11.
  * Ejecución de instalación con resolución de pares legados (`npm install --legacy-peer-deps`).
* **Resultado:** 389 paquetes instalados y auditados exitosamente.

### 2.2 Móvil (`mobile/`)
* **Acción:** Instalación del ecosistema completo de Expo SDK 52, expo-router v4, expo-sqlite, expo-location, Zustand y `@maplibre/maplibre-react-native`.
* **Resultado:** 1045 paquetes instalados correctamente.

---

## 3. Resolución de Compilación TypeScript del Backend

### 3.1 Corrección de Rutas del Monorepo (`shared/types`)
* **Causa raíz:** Las entidades y DTOs del backend hacían referencia relativa a una carpeta `shared/types` situada fuera de la raíz del compilador (`rootDir`).
* **Acción técnica:**
  1. Creación de módulo local de tipos en [`backend/src/shared/types/index.ts`](file:///C:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/backend/src/shared/types/index.ts).
  2. Reconfiguración de importaciones en entidades (`UserEntity`, `RouteEntity`, `RoadIncidentEntity`, `TelemetryPointEntity`) y servicios.
  3. Ajuste de `rootDir: "./src"` y `outDir: "./dist"` en `tsconfig.json`.

### 3.2 Resultado del Build
* **Comando:** `npx nest build`
* **Código de salida:** `0` (Cero errores de tipado).
* **Artefacto generado:** Punto de entrada ejecutable en [`backend/dist/main.js`](file:///C:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/backend/dist/main.js).

---

## 4. Diagnóstico de Virtualización y Solución de Base de Datos

### 4.1 Fallo de Docker Desktop
* **Mensaje del sistema:** *"Windows reports that its hypervisor is not running and hardware virtualization is turned off in UEFI/BIOS"*.
* **Análisis de causa:** La máquina física tiene la opción Intel VT-x o AMD-V/SVM inactiva en el firmware, lo que impide a Docker Desktop inicializar el subsistema WSL2 / Hyper-V.

### 4.2 Detección de PostgreSQL Nativo
* **Inspección de red:** Se detectó una instancia nativa de PostgreSQL escuchando activamente en el puerto TCP `5432` con usuario maestro `postgres` y clave `postgrespassword`.
* **Superación del conflicto de Collation en Windows:**
  * Al intentar `CREATE DATABASE`, el motor arrojó: *"discordancia en la versión de collation de la base de datos patrón template1"*.
  * Se solventó creando la base de datos clonando la plantilla limpia:
    ```sql
    CREATE DATABASE transporte_colombia TEMPLATE template0;
    ```
* **Estado final de persistencia:** Base de datos `transporte_colombia` aprovisionada. Al iniciar el backend, **TypeORM** sincronizó automáticamente las 5 tablas del modelo:
  1. `usuarios`
  2. `rutas_entrega`
  3. `tramos_ruta`
  4. `incidentes_viales`
  5. `telemetria_puntos`

---

## 5. Pruebas de Integración y Verificación de Endpoints

### 5.1 Documentación Swagger
* **Endpoint:** `http://localhost:3000/api/docs`
* **Respuesta HTTP:** `200 OK`
* **Interfaz:** Swagger UI completamente funcional para probar rutas interactivamente.

### 5.2 Sembrado y Consulta de Datos de Prueba (INVIAS)
* **Petición ejecutada:** `POST http://localhost:3000/road-incidents/sync/invias`
* **Resultado:** `{"count": 2}` incidentes creados (Ruta 40 Bogotá-Girardot y Ruta 25 Medellín-Manizales).
* **Comprobación:** `GET http://localhost:3000/road-incidents` devolvió los registros con coordenadas geoespaciales y niveles de retraso estimado en minutos.

---

## 6. Guía Rápida para Continuar el Desarrollo

### Para reiniciar el backend en cualquier momento:
```powershell
cd C:\Users\Duber\.gemini\antigravity\scratch\transporte_colombia_rn\backend
npm run start:dev
```

### Para iniciar la aplicación móvil:
```powershell
cd C:\Users\Duber\.gemini\antigravity\scratch\transporte_colombia_rn\mobile
npx expo start
```

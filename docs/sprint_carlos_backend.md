# Plan de Trabajo Individual: Carlos (Rama `Carlos`)

Este documento detalla el plan de trabajo exhaustivo de 11 tareas de producción para el backend NestJS (`Transporte-Comercial-BACK`), enfocado en lógica transaccional, normatividad de carga y persistencia robusta.

---

## 1. Credenciales y Conexiones Locales

| Entorno | Detalle | Parámetro de Conexión |
| :--- | :--- | :--- |
| **PostgreSQL** | Base de Datos Principal | `postgresql://postgres:postgrespassword@localhost:5432/transporte_colombia` |
| **Swagger** | Documentación OpenAPI | `http://localhost:3000/api/docs` |
| **Token Operador** | `operador@transporte.com` | Contraseña: `Prueba123!` |
| **Token Conductor** | `conductor@transporte.com` | Contraseña: `Prueba123!` |

---

## 2. Backlog Exhaustivo de Tareas

### Tarea CAR-01: Módulo y Entidad de Estaciones de Peaje (`toll.entity.ts`)
* **Archivos:** `src/tolls/entities/toll.entity.ts`, `src/tolls/tolls.service.ts`, `src/tolls/tolls.module.ts`.
* **Descripción:** Modelar tabla con nombre del peaje, concesión vial, coordenadas geográficas y tarifas vigentes en Colombia para categorías I a V.

### Tarea CAR-02: Endpoint de Estimación de Peajes y Costos (`POST /routes/estimate-tolls`)
* **Archivos:** `src/tolls/tolls.controller.ts`, `src/tolls/tolls.service.ts`.
* **Descripción:** Recibir las coordenadas de origen y destino junto con la categoría del camión (`C2`, `C3`, `C3S3`) y retornar el listado de peajes que interceptan la ruta con el costo total acumulado en COP.

### Tarea CAR-03: Módulo de Prueba de Entrega Digital POD (`pod.entity.ts`)
* **Archivos:** `src/routes/entities/pod.entity.ts`, `src/routes/routes.service.ts`, `src/routes/routes.controller.ts`.
* **Descripción:** Endpoint `POST /routes/:id/pod` para almacenar la firma digital en base64 del receptor, cédula, nombre, observaciones y fotografías de respaldo de la entrega.

### Tarea CAR-04: Módulo de Inspección Pre-operacional del Camión
* **Archivos:** `src/routes/entities/inspection.entity.ts`, `src/routes/routes.service.ts`.
* **Descripción:** Endpoint `POST /routes/:id/pre-inspection` para validar el checklist del camión antes de permitir que la ruta pase al estado `en_ruta`.

### Tarea CAR-05: Endpoint de Suspensión Justificada (`PATCH /routes/:id/suspend`)
* **Archivos:** `src/routes/routes.controller.ts`, `src/routes/routes.service.ts`.
* **Descripción:** Endpoint que valida el motivo de suspensión suministrado (`derrumbe`, `falla_mecanica`, `descanso`, `autoridades`) y transiciona el viaje a `en_suspension`.

### Tarea CAR-06: Endpoint de Consulta por Manifiesto (`GET /routes/track/:code`)
* **Archivos:** `src/routes/routes.controller.ts`, `src/routes/routes.service.ts`.
* **Descripción:** Endpoint público que recibe un código de manifiesto (ej: `MAN-40-BOG-GIR`) y devuelve el estado actual, conductor asignado, hora pactada y retraso recalculado sin exponer contraseñas ni datos sensibles.

### Tarea CAR-07: Bitácora de Auditoría Transaccional (`route-audit.entity.ts`)
* **Archivos:** `src/routes/entities/route-audit.entity.ts`, `src/routes/routes.service.ts`.
* **Descripción:** Cada vez que una ruta cambia de estado (`pendiente` -> `en_ruta` -> `en_suspension` -> `completada`), registrar automáticamente el usuario responsable, timestamp y motivo del cambio.

### Tarea CAR-08: Semilla Completa de Incidentes INVIAS (`seed-incidentes.ts`)
* **Archivo:** `src/database/seeds/seed-incidentes.ts`.
* **Descripción:** Sembrar en PostgreSQL incidentes reales sobre los principales pasos de cordillera de Colombia: Alto de La Línea, Cañón del Cauca, Vía al Llano, Ventanas y Páramo de Letras.

### Tarea CAR-09: Endpoint de Monitoreo de Salud del Sistema (`GET /health`)
* **Archivo:** `src/app.controller.ts`.
* **Descripción:** Endpoint que responde el estado de salud de la API, tiempo de actividad (uptime) y verificación de conectividad con PostgreSQL.

### Tarea CAR-10: Pruebas Unitarias del Servicio de Rutas (`routes.service.spec.ts`)
* **Archivo:** `src/routes/routes.service.spec.ts`.
* **Descripción:** Crear suite de pruebas con Jest para validar:
  1. Que un conductor no pueda iniciar dos viajes simultáneamente.
  2. Que una ruta suspendida requiera motivo.
  3. Que el cálculo de retraso sume los minutos de incidentes que intercepten el corredor.

### Tarea CAR-11: Dockerización del Entorno de Backend
* **Archivos:** `Dockerfile`, `docker-compose.yml`.
* **Descripción:** Configurar contenedor Docker para NestJS en modo producción y orquestación con PostgreSQL 15, garantizando despliegue portable en cualquier servidor.

---

## 3. Comandos de Verificación

```bash
# Compilar TypeScript sin errores
npm run build

# Ejecutar pruebas unitarias
npm test

# Sincronizar en rama individual
git add .
git commit -m "feat(backend-prod): peajes, POD, auditoria y dockerizacion"
git push origin Carlos
```

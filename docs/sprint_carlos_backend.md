# Plan de Trabajo Individual: Carlos (Rama `Carlos`)

Este documento detalla las tareas asignadas para el backend NestJS (`Transporte-Comercial-BACK`), asegurando persistencia transaccional, trazabilidad y endpoints para soporte de operaciones y clientes.

---

## 1. Credenciales de Acceso a Base de Datos y APIs

| Servicio | Variable de Entorno | Valor Local Oficial |
| :--- | :--- | :--- |
| **Base de Datos** | `postgresql://...` | `postgresql://postgres:postgrespassword@localhost:5432/transporte_colombia` |
| **Documentación** | Swagger UI | `http://localhost:3000/api/docs` |
| **Token de Prueba Operador** | `operador@transporte.com` | Contraseña: `Prueba123!` |
| **Token de Prueba Conductor** | `conductor@transporte.com` | Contraseña: `Prueba123!` |

---

## 2. Tareas Asignadas Paso a Paso

### Tarea CAR-01: Endpoint de Suspensión Justificada (`PATCH /routes/:id/suspend`)
* **Objetivo:** Permitir que al suspender un viaje en carretera, el conductor u operador suministre obligatoriamente el motivo (`derrumbe`, `falla_mecanica`, `descanso`).
* **Archivos:** `src/routes/routes.controller.ts`, `src/routes/routes.service.ts`, `src/routes/route.dto.ts`.
* **Pasos:**
  1. En `src/routes/route.dto.ts`, crear:
     ```typescript
     export class SuspendRouteDto {
       @ApiProperty({ description: 'Motivo de la suspensión temporal' })
       @IsString()
       @IsNotEmpty()
       motivo: string;
     }
     ```
  2. En `src/routes/routes.service.ts`, agregar método `suspendRoute(id: string, motivo: string, user: UserEntity)`:
     * Verificar que la ruta exista y pertenezca al conductor o el usuario sea operador.
     * Cambiar estado a `RouteStatus.SUSPENDED` (`en_suspension`).
     * Guardar el cambio y registrar en consola o log el motivo de la suspensión.
  3. En `src/routes/routes.controller.ts`, exponer `@Patch(':id/suspend')`.
* **Comando de verificación:** Ejecutar `npm run build` en la terminal del backend.

---

### Tarea CAR-02: Endpoint de Consulta por Manifiesto (`GET /routes/track/:code`)
* **Objetivo:** Permitir a clientes consultar el estado y retraso de su carga buscando por número de manifiesto (ej: `MAN-40-BOG-GIR`).
* **Archivos:** `src/routes/routes.controller.ts`, `src/routes/routes.service.ts`.
* **Pasos:**
  1. En `routes.service.ts`:
     ```typescript
     async findByManifest(code: string) {
       const route = await this.routes.findOne({
         where: { codigoManifiesto: code },
         relations: ['usuario'],
       });
       if (!route) throw new NotFoundException('Manifiesto no encontrado');
       return {
         codigoManifiesto: route.codigoManifiesto,
         origen: route.origenNombre,
         destino: route.destinoNombre,
         estado: route.estado,
         etaPactado: route.etaPactado,
         distanciaKm: route.distanciaTotalKm,
         tiempoBaseMin: route.tiempoEstimadoBaseMin,
         conductor: route.usuario?.nombre || 'Asignado',
       };
     }
     ```
  2. En `routes.controller.ts`, agregar endpoint público o con JWT `@Get('track/:code')`.
* **Comando de verificación:** `curl http://localhost:3000/routes/track/MAN-40-BOG-GIR`.

---

### Tarea CAR-03: Semilla Oficial de Incidentes Viales de Colombia
* **Objetivo:** Disponer de incidentes de prueba sobre corredores reales (Ruta 40, Ruta 25 y Ruta 50) para que el motor de retrasos siempre tenga datos evaluables.
* **Archivo:** `src/database/seeds/seed-incidentes.ts`.
* **Pasos:**
  1. Crear archivo con 5 incidentes reales:
     * Cierre parcial por derrumbe en Alto de La Línea (Ruta 40).
     * Mantenimiento vial en Silvania (Bogotá - Girardot).
     * Paso restringido en La Pintada (Medellín - Manizales).
     * Protesta ciudadana en El Cerrito (Cali - Palmira).
     * Cierre preventivo por lluvia en Vía al Llano (Bogotá - Villavicencio).
  2. Agregar comando o función autoejecutable en `AppModule` si la tabla `incidentes_viales` tiene 0 registros.
* **Comando de verificación:** Verificar en Swagger `GET /road-incidents` con status 200.

---

## 3. Verificación y Entrega

```bash
# 1. Compilar y asegurar cero errores de TypeScript
npm run build

# 2. Confirmar cambios en rama propia
git add .
git commit -m "feat(routes-backend): endpoint de suspension justificada y tracking por manifiesto"
git push origin Carlos
```

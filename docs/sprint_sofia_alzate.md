# Plan de Trabajo Individual: Sofia Alzate (Rama `Sofia`)

Este documento contiene el plan de trabajo detallado de 10 tareas de producción para la estandarización de contratos de carga RNDC, experiencia del cliente y aseguramiento de calidad QA.

---

## 1. Credenciales de Prueba del Sistema

| Rol | Correo de Acceso | Contraseña | Uso en Validación |
| :--- | :--- | :--- | :--- |
| **Cliente / Consulta** | `cliente@transporte.com` | `Prueba123!` | Validación de búsqueda de remesas, consulta de ETA y novedades. |
| **Operador Central** | `operador@transporte.com` | `Prueba123!` | Creación de despachos con manifiesto y tipología vehicular. |
| **Conductor** | `conductor@transporte.com` | `Prueba123!` | Verificación de checklists y registro de entrega con firma. |

---

## 2. Backlog Exhaustivo de Tareas

### Tarea SOF-01: Contratos de Datos RNDC y Tipología Vehicular
* **Archivo:** `transporte_colombia_front/src/shared/types/index.ts`.
* **Descripción:** Definir enumeraciones y modelos para vehículos de carga colombianos:
  * `VehicleType`: `C2` (Camión sencillo 2 ejes), `C3` (Dobletroque 3 ejes), `C3S3` (Tractocamión con semirremolque de 3 ejes).
  * `CargoDetails`: tipo de mercancía (seca, refrigerada, peligrosa), peso en kilogramos, volumen en metros cúbicos y valor asegurado en COP.

### Tarea SOF-02: Contrato de Prueba de Entrega Digital (POD)
* **Archivo:** `transporte_colombia_front/src/shared/types/index.ts`.
* **Descripción:** Especificar la interfaz `IProofOfDelivery`:
  * `firmaBase64`: trazado vectorial de la firma en pantalla.
  * `nombreReceptor`, `cedulaReceptor`, `observaciones`.
  * `fotosEvidencia`: arreglo de URIs de fotografías de la carga entregada.
  * `fechaHoraEntrega`, `latitudEntrega`, `longitudEntrega`.

### Tarea SOF-03: Contrato de Inspección Pre-operacional del Camión
* **Archivo:** `transporte_colombia_front/src/shared/types/index.ts`.
* **Descripción:** Especificar la interfaz `IVehicleInspection`:
  * Estado de frenos, nivel de aceite, presión de llantas, luces, kit de carreteras.
  * Vigencia de SOAT y Revisión Técnico-Mecánica.
  * Firma de conformidad del conductor antes de encender el motor.

### Tarea SOF-04: Contrato de Estaciones de Peaje y Tarifas Viales
* **Archivo:** `transporte_colombia_front/src/shared/types/index.ts`.
* **Descripción:** Especificar la interfaz `ITollStation`:
  * `nombrePeaje`, `concesionVial`, `latitud`, `longitud`.
  * Tarifas oficiales según categoría de vehículo (Categoría I a V).

### Tarea SOF-05: Componente de Rastreo Público por Manifiesto (`TrackingClienteModal.tsx`)
* **Archivo:** `transporte_colombia_front/src/presentation/components/TrackingClienteModal.tsx`.
* **Descripción:** Diseñar modal con barra de búsqueda para que el cliente ingrese su código de remesa (`MAN-XXXXX`) y visualice el estado sin necesidad de iniciar sesión de operador.

### Tarea SOF-06: Vista Detallada de Estado de Carga para Clientes
* **Archivo:** `transporte_colombia_front/src/presentation/components/DetalleCargaCliente.tsx`.
* **Descripción:** Componente que despliega la barra de progreso del viaje (Salida -> En Tránsito -> Llegada), tiempo restante ajustado por incidentes y ubicación del último reporte.

### Tarea SOF-07: Catálogo de Corredores y Peajes Nacionales de Colombia
* **Archivo:** `transporte_colombia_front/docs/catalogo_vias_colombia.md`.
* **Descripción:** Documentar las 5 rutas troncales principales de Colombia (Ruta 40 Bogotá-Buenaventura, Ruta 25 Medellín-Cali, Ruta 45 Bogotá-Costa Caribe, Ruta 50 Bogotá-Manizales, Ruta 65 Villavicencio-Yopal) con sus peajes clave.

### Tarea SOF-08: Matriz de 25 Casos de Prueba de Aceptación (QA Integral)
* **Archivo:** `transporte_colombia_front/docs/manual_qa_aceptacion.md`.
* **Descripción:** Documentar casos de prueba para:
  1. Conductor intentando aceptar dos viajes activos.
  2. Suspensión de ruta con y sin motivo justificado.
  3. Desconexión de internet en pleno tránsito y reconexión posterior.
  4. Recálculo automático de ETA ante derrumbe.

### Tarea SOF-09: Manual de Procedimiento para Conductores en Carretera
* **Archivo:** `transporte_colombia_front/docs/manual_conductor.md`.
* **Descripción:** Guía paso a paso ilustrada explicando cómo iniciar el viaje, cómo reportar una novedad en vía, cómo actuar ante un derrumbe y cómo recolectar la firma digital de entrega.

### Tarea SOF-10: Manual de Gestión y Despacho para Operadores de Central
* **Archivo:** `transporte_colombia_front/docs/manual_operador.md`.
* **Descripción:** Guía de operaciones que detalla la asignación de conductores, interpretación de alertas de retraso vial del INVIAS y procedimientos de contingencia en caso de cierre total de carretera.

---

## 3. Comandos de Verificación

```bash
# Validar sintaxis y tipado estricto
npm run lint

# Sincronizar en rama individual
git add .
git commit -m "feat(types-qa): paquete integral de contratos RNDC, tracking y manuales"
git push origin Sofia
```

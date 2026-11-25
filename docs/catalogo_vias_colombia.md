# Catálogo de Corredores y Peajes Nacionales de Colombia

**Task:** SOF-07 · **Versión:** 1.0 · **Fecha:** 2026-11-25

Este catálogo es la fuente de referencia operativa para la configuración de rutas, cálculo de costos de peaje y alertas de la central. Las tarifas informadas corresponden a **categoría I** y se usan solo como línea base: la tarifa vigente por categoría (I a V) debe cargarse en `ITollStation.tarifas` desde la resolución del concesionario o del portal del Ministerio de Transporte/ANI antes de despachar.

## 1. Contrato de datos aplicable

```ts
interface ITollStation {
  nombrePeaje: string;
  concesionVial: string;
  latitud: number;
  longitud: number;
  tarifas: Record<TollCategory, number>; // COP por categoría I..V
  actualizadoEn?: string;
}
```

Equivalencia operativa RNDC ↔ categoría de peaje usada en `VEHICLE_TOLL_CATEGORY`:

| Tipología RNDC | Descripción | Categoría de peaje |
| :--- | :--- | :--- |
| C2 | Camión sencillo de 2 ejes | II |
| C3 | Dobletroque de 3 ejes | III |
| C3S3 | Tractocamión con semirremolque de 3 ejes | V |

> La categoría definitiva depende del número de ejes y de la configuración del vehículo conforme a la resolución vigente. Validar siempre con la boleta de peaje y el concesionario antes de liquidar.

## 2. Corredores troncales

### 2.1 Ruta 40 — Bogotá–Buenaventura

Tramo andino + valle del Cauca + vía al Pacífico. Longitud de referencia: ~594 km; 11 casetas; tiempo operativo realista 11–13 h.

| Peaje clave | Departamento | Concesión / operador | Referencia Cat. I |
| :--- | :--- | :--- | ---: |
| Chusacá | Cundinamarca | Vía Sumapaz / Bogotá–Girardot | $17.800 |
| Chinauta | Cundinamarca | Vía Sumapaz / Bogotá–Girardot | $17.800 |
| Flandes | Tolima | Neiva–Espinal–Girardot | $17.800 |
| Gualanday | Tolima | San Rafael | $16.100 |
| Cajamarca | Tolima | APP GICA / Cruce Cordillera Central | $16.800 |
| Corozal | Quindío | Rutas del Valle / Calarcá–La Paila | $18.400 |
| La Uribe | Valle del Cauca | Rutas del Valle | $17.800 |
| Betania | Valle del Cauca | Rutas del Valle | $17.800 |
| El Cerrito | Valle del Cauca | Rutas del Valle | $16.800 |
| Ciat | Valle del Cauca | Rutas del Valle | $16.800 |
| Loboguerrero | Valle del Cauca | Vía Pacífico / Buga–Buenaventura | $16.900 |

**Riesgos:** descensos prolongados hacia Cali y Buenaventura, alta pluviosidad en el Pacífico, derrumbes en la vía Buga–Loboguerrero. Exigir revisión de frenos y kit de carreteras antes del despacho.

### 2.2 Ruta 25 — Medellín–Cali

Corredor por La Pintada, Supía, Cartago y Buga. Longitud de referencia: ~424 km; 9 casetas; tiempo operativo realista 8–10 h.

| Peaje clave | Departamento | Concesión / operador | Referencia Cat. I |
| :--- | :--- | :--- | ---: |
| Primavera | Antioquia | Pacífico 1 | $18.900 |
| La Pintada | Antioquia | Concesión La Pintada | $23.900 (referencial) |
| Supía | Caldas | Pacífico 3 | $18.900 |
| Acapulco | Caldas | Pacífico 3 | $18.900 |
| San Clemente | Risaralda | INVIAS / Vías del Samán | $15.600 |
| Cerritos | Risaralda | Vías del Samán / Pacífico 3 | $19.800 |
| La Uribe | Valle del Cauca | Rutas del Valle | $17.800 |
| Betania | Valle del Cauca | Rutas del Valle | $17.800 |
| El Cerrito / Rozo | Valle del Cauca | Rutas del Valle | $16.800 |

**Riesgos:** cierres programados en La Pintada–Primavera, deslizamientos en La Quiebra y niebla en cruces de cordillera.

### 2.3 Ruta 45 — Bogotá–Costa Caribe

Corredor norte por la Troncal Central (45A) y conexión Ruta del Sol / Magdalena Medio hacia la costa. Los peajes varían según se tome la variante Tunja–Bucaramanga–San Alberto o la variante Honda–Puerto Boyacá–Barrancabermeja.

| Peaje clave | Departamento | Concesión / operador | Observación |
| :--- | :--- | :--- | :--- |
| Río Bogotá | Cundinamarca | Autopista Norte / BTS | Salida norte de Bogotá |
| Andes | Cundinamarca | Ruta 45A04 | Autopista Norte PR 2+600 |
| Casablanca | Cundinamarca | Ruta 45A04 | Zipaquirá–Ubaté |
| El Corzo / Jalisco | Cundinamarca–Boyacá | Troncal Central | Referencia Bogotá–Coveñas |
| Puerto Salgar / La Lizama | Santander | ANI / Concesión Bucaramanga–Barrancabermeja–Yondó | Magdalena Medio |
| El Carmen | Bolívar | Concesionaria Vial Montes de María | Conexión costera |
| Gambote / Pasacaballos | Bolívar–Cartagena | Autopistas del Caribe | Acceso Cartagena |

**Riesgos:** cierres totales programados en la Troncal Central, paso a un carril por obras y restricciones por peso en puentes del Magdalena Medio.

### 2.4 Ruta 50 — Bogotá–Manizales

Corredor por Honda e Ibagué con conexión al Eje Cafetero. Longitud de referencia: ~285 km hasta el eje cafetero por la variante Siberia/La Vega; 4 casetas base.

| Peaje clave | Departamento | Concesión / operador | Observación |
| :--- | :--- | :--- | :--- |
| Siberia | Cundinamarca | Concesionaria Panamericana | Salida Bogotá–La Vega |
| La Vega | Cundinamarca | Concesionaria Panamericana | Tramo 08 Bogotá–Honda |
| Honda | Tolima | Ruta 50 | control de peso |
| Irra | Caldas | Autopistas del Café | Manizales–La Pintada |

**Riesgos:** fuertes pendientes en la subida a Manizales, neblina y baja visibilidad en el cruce de cordillera.

### 2.5 Ruta 65 — Villavicencio–Yopal

Corredor de los Llanos. Cuatro casetas en el acceso desde Bogotá a Villavicencio (Boquerón, Boquerón II, Naranjal, Pipiral) y tres en el corredor Villavicencio–Yopal (Puente Amarillo, Veracruz, San Pedro), operadas por COVIORIENTE.

| Peaje clave | Ubicación | Concesión / operador | Observación |
| :--- | :--- | :--- | :--- |
| Pipiral / Naranjal | Villavicencio | COVIORIENTE | Acceso desde Bogotá |
| Boquerón / Boquerón II | Villavicencio | COVIORIENTE | Doble calzada |
| Puente Amarillo | Entre Villavicencio y Restrepo | COVIORIENTE | Tarifa congelada durante intervenciones |
| Veracruz | Cumaral–Paratebueno | COVIORIENTE | Tramo crítico de drenaje |
| San Pedro | Villanueva | COVIORIENTE | Último control antes de Yopal |

**Riesgos:** inundaciones sectoriales, cierre por temporada de lluvias y restricciones nocturnas. Verificar #767 (INVIAS) antes del despacho.

## 3. Mantenimiento del catálogo

1. Consultar las tarifas oficiales en el portal de peajes del Ministerio de Transporte y en `https://plc.mintransporte.gov.co/` (tableros por corredor).
2. Confirmar concesión vigente y PR/Km en el mapa de peajes de ANI/INVIAS.
3. Actualizar `tarifas` por categoría y `actualizadoEn` en cada `ITollStation`.
4. Registrar en el manifiesto el peaje, la categoría cobrada y el comprobante para la liquidación del flete.

**Fuentes consultadas:** portal logístico del MinTransporte, mapa de peajes ANI/INVIAS, COVIORIENTE, Concesión La Pintada y AMA Colombia (valores referenciales de corredor).

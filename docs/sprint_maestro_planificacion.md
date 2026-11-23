# Plan Maestro Exhaustivo de Producción: Sistema de Transporte Colombia

Este documento presenta la arquitectura integral, brechas operativas detectadas y el backlog completo de producción sin fechas fijas (orientado a hitos de calidad industrial).

---

## 1. Diagnóstico de Brechas para Despliegue en Producción

El sistema cuenta actualmente con autenticación básica, listado de rutas, trazado OSRM y validación de viaje único. Sin embargo, para operar en el sector logístico comercial de Colombia faltan los siguientes pilares industriales:

```
[ESTADO ACTUAL]                             [ESTADO OBJETIVO DE PRODUCCIÓN]
- Manifiesto solo texto                    -> Cumplimiento RNDC (Ministerio de Transporte)
- Sin cálculo de peajes                    -> Detección de peajes e importes por categoría C2-C3S3
- Sin telemetría continua                  -> Tracking GPS en segundo plano con geocercas
- Cierre sin verificación                  -> Prueba de Entrega Digital (POD) con firma y fotos
- Sin reportes de contingencia             -> Botón SOS en cabina y ruteo alternativo por cierres
- Mapa monovehículo                        -> Torre de Control con monitoreo multivehículo en vivo
- Sin checklist de vehículo                -> Inspección pre-operacional obligatoria antes de iniciar
```

---

## 2. Pilares de la Solución de Transporte Comercial

1. **Normatividad y Datos de Carga (RNDC):** Tipología vehicular (C2, C3, C3S3), peso bruto vehicular, volumen, mercancías peligrosas y seguro.
2. **Costos y Peajes en Ruta:** Estimación de gasto en peajes nacionales y consumo proyectado de diésel (ACPM).
3. **Telemetría y Detección de Desvíos:** Monitoreo en segundo plano, alertas si el camión se aleja más de 500m del eje vial y paradas no autorizadas.
4. **Prueba de Entrega Digital (POD):** Firma en pantalla del receptor, captura fotográfica de remesa y reporte de faltantes/averías.
5. **Torre de Control Multivehículo:** Visualización simultánea de toda la flota activa sobre el mapa de carreteras de Colombia.
6. **Resiliencia en Cordillera (Offline-First):** Operación total sin señal 4G en pasos de montaña con sincronización automática en lotes.

---

## 3. Matriz de Credenciales Oficiales de Prueba

| Rol de Usuario | Correo Electrónico | Contraseña | UUID en Base de Datos | Alcance de Operación |
| :--- | :--- | :--- | :--- | :--- |
| **Operador Central** | `operador@transporte.com` | `Prueba123!` | `a9262da3-a6c3-43a2-bc7e-1ba0a30c15c0` | Despacho RNDC, torre de control, asignación de flota y contingencias. |
| **Conductor Principal** | `conductor@transporte.com` | `Prueba123!` | `626f30b3-39b9-4559-a794-654321b35b36` | Inspección pre-operacional, GPS en vía, reporte SOS y firma POD. |
| **Cliente / Consulta** | `cliente@transporte.com` | `Prueba123!` | `405f5f6a-2811-4883-8e96-5334373e0adb` | Tracking de manifiesto, alertas de retraso y comprobante de entrega. |

---

## 4. Distribución del Backlog Industrial por Integrante

| Integrante | Rama Git | Especialidad | Cantidad de Tareas | Documento Individual |
| :--- | :--- | :--- | :--- | :--- |
| **Sofia Alzate** | `Sofia` | Contratos, RNDC, QA & Vista Cliente | 10 tareas | [sprint_sofia_alzate.md](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/docs/sprint_sofia_alzate.md) |
| **Carlos** | `Carlos` | Backend NestJS, Peajes, Geocercas & POD | 11 tareas | [sprint_carlos_backend.md](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/docs/sprint_carlos_backend.md) |
| **Isabella** | `Isabella` | Frontend Offline, GPS Fondo, Firma & SOS | 10 tareas | [sprint_isabella_frontend.md](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/docs/sprint_isabella_frontend.md) |
| **Duber** | `Duber` | Lead Frontend, Torre de Control, UX & OSRM | 11 tareas | [sprint_duber_lead.md](file:///C:/Users/Duber/.gemini/antigravity/scratch/Trasporte_Comercial/transporte_colombia_front/docs/sprint_duber_lead.md) |

---

## 5. Criterios de Aceptación para Salida a Producción

1. **Compilación sin errores:** `npm run lint` (frontend) y `npm run build` (backend) pasan al 100%.
2. **Cobertura de pruebas:** Casos de prueba unitarios para cálculo de retrasos y validaciones de conductor.
3. **Persistencia transaccional:** Cero pérdida de puntos de telemetría durante desconexión de red en pasos de cordillera.
4. **Seguridad y permisos:** Restricción estricta de rutas API según JWT de cada rol.

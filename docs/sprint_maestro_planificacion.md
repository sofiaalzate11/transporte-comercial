# Sprint Maestro: Sistema de Transporte Comercial Colombia

Este documento establece la visión técnica integral, objetivos de negocio y arquitectura de producción para llevar la plataforma al despliegue final sin fechas fijas (orientado a hitos de calidad).

---

## 1. Visión y Objetivo Central del Proyecto

* **Problema:** En Colombia, la geografía andina y las contingencias viales (derrumbes, cierres por lluvia, pasos restringidos e incidentes) generan sobrecostos logísticos masivos y retrasos impredecibles en el transporte de carga pesada.
* **Misión del Software:** Proveer una plataforma integral que anticipe, detecte y mitigue retrasos en ruta en tiempo real, coordinando a la central de operaciones, conductores en carretera y clientes finales.
* **Ecosistema de Usuarios:**
  1. **Operador Central:** Despacha remesas, asigna vehículos, monitorea la red vial nacional (INVIAS #767) y gestiona contingencias.
  2. **Conductor:** Recibe despachos, inicia viajes, reporta novedades en carretera (con soporte Offline-First para pasos de cordillera sin señal) y actualiza estados de entrega.
  3. **Cliente / Consulta:** Monitorea el progreso de su manifiesto de carga con recálculo dinámico de hora estimada de llegada (ETA).

---

## 2. Credenciales y Cuentas de Prueba Oficiales

| Rol de Usuario | Correo de Acceso | Contraseña | Identificador UUID | Permisos en la Plataforma |
| :--- | :--- | :--- | :--- | :--- |
| **Operador Central** | `operador@transporte.com` | `Prueba123!` | `a9262da3-a6c3-43a2-bc7e-1ba0a30c15c0` | Despacho de rutas, asignación de conductores, gestión de incidentes y métricas. |
| **Conductor** | `conductor@transporte.com` | `Prueba123!` | `626f30b3-39b9-4559-a794-654321b35b36` | Aceptación de viaje, reportes viales, cambios de estado (`en_ruta`, `en_suspension`, `completada`). |
| **Cliente (Consulta)** | `cliente@transporte.com` | `Prueba123!` | `405f5f6a-2811-4883-8e96-5334373e0adb` | Seguimiento de manifiestos, consulta de ETA y alertas de afectación. |

---

## 3. Matriz de Asignación por Integrante

Cada integrante cuenta con su propio documento de trabajo detallado paso a paso:

| Integrante | Rama Git | Especialidad y Módulo | Documento de Trabajo Individual |
| :--- | :--- | :--- | :--- |
| **Sofia Alzate** | `Sofia` | Tipado, QA Integral y Vista Cliente | [sprint_sofia_alzate.md](file:///C:/Users/Duber/.gemini/antigravity/brain/a7b8c722-bc40-44ed-9456-ff8bc139d1df/sprint_sofia_alzate.md) |
| **Carlos** | `Carlos` | Backend NestJS, Auditoría y Seeds | [sprint_carlos_backend.md](file:///C:/Users/Duber/.gemini/antigravity/brain/a7b8c722-bc40-44ed-9456-ff8bc139d1df/sprint_carlos_backend.md) |
| **Isabella** | `Isabella` | Dominio, Offline-First y Reportes Móviles | [sprint_isabella_frontend.md](file:///C:/Users/Duber/.gemini/antigravity/brain/a7b8c722-bc40-44ed-9456-ff8bc139d1df/sprint_isabella_frontend.md) |
| **Duber** | `Duber` | Lead Frontend, UX/UI y Telemetría en Mapa | [sprint_duber_lead.md](file:///C:/Users/Duber/.gemini/antigravity/brain/a7b8c722-bc40-44ed-9456-ff8bc139d1df/sprint_duber_lead.md) |

---

## 4. Criterios de Aceptación Globales del Sprint

1. **Cero regresiones:** `npm run lint` en frontend y `npm run build` en backend deben ejecutarse con 0 errores.
2. **Restricción de negocio:** Un conductor jamás podrá tener 2 viajes activos simultáneamente.
3. **Resiliencia en cordillera:** Todas las operaciones del conductor deben funcionar sin señal y sincronizarse al recuperar 4G.
4. **Trazabilidad:** Cualquier cambio de estado de viaje debe registrar fecha, hora y motivo.

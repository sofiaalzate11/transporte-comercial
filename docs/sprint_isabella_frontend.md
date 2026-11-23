# Plan de Trabajo Individual: Isabella (Rama `Isabella`)

Este documento detalla el plan de trabajo de 10 tareas de producción para el frontend móvil (`transporte_colombia_front`), enfocado en la experiencia del conductor en carretera, resiliencia offline y captura de pruebas en terreno.

---

## 1. Credenciales de Prueba del Sistema

| Rol | Correo de Acceso | Contraseña | Uso en Validación |
| :--- | :--- | :--- | :--- |
| **Conductor** | `conductor@transporte.com` | `Prueba123!` | Validación de inspección preoperacional, botón SOS, firma de entrega y GPS. |
| **Operador** | `operador@transporte.com` | `Prueba123!` | Verificación de recepción de novedades, firmas y telemetría de ruta. |

---

## 2. Backlog Exhaustivo de Tareas

### Tarea ISA-01: Formateadores Viales y Moneda Colombiana (`formatters.ts`)
* **Archivo:** `transporte_colombia_front/src/shared/utils/formatters.ts`.
* **Descripción:** Implementar funciones para formatear distancias (`135.5 km`), tiempos de conducción (`3h 45m`), moneda nacional (`$ 45.000 COP`) y peso de carga (`28.5 Ton`).

### Tarea ISA-02: Modal de Suspensión Justificada (`SuspensionModal.tsx`)
* **Archivo:** `transporte_colombia_front/src/presentation/components/SuspensionModal.tsx`.
* **Descripción:** Diseñar modal emergente que exige al conductor seleccionar el motivo antes de suspender el viaje (Derrumbe, Falla Mecánica, Control Policial, Descanso Obligatorio).

### Tarea ISA-03: Componente de Firma Digital en Pantalla (`SignaturePadModal.tsx`)
* **Archivo:** `transporte_colombia_front/src/presentation/components/SignaturePadModal.tsx`.
* **Descripción:** Permitir al cliente o receptor firmar directamente con el dedo sobre la pantalla al momento de entregar la mercancía, capturando el trazo en Base64.

### Tarea ISA-04: Checklist de Inspección Pre-operacional del Camión
* **Archivo:** `transporte_colombia_front/src/presentation/components/PreInspectionModal.tsx`.
* **Descripción:** Formulario obligatorio antes de iniciar el viaje: verificación visual de presión de llantas, frenos de aire, luces, nivel de refrigerante y kit de derrames.

### Tarea ISA-05: Captura y Adjunto de Fotos de Remesa y Mercancía
* **Archivo:** `transporte_colombia_front/src/presentation/components/EvidenceCameraPicker.tsx`.
* **Descripción:** Módulo para tomar o adjuntar fotos de la carga entregada y la remesa física sellada para certificar la entrega completa.

### Tarea ISA-06: Formulario de Reporte de Novedades en Vía por Conductor
* **Archivo:** `transporte_colombia_front/src/presentation/components/ReportIncidentModal.tsx`.
* **Descripción:** Permitir al conductor reportar en 2 clics si encuentra un derrumbe, retén o accidente en carretera, enviando automáticamente sus coordenadas GPS actuales.

### Tarea ISA-07: Botón SOS de Emergencia en Cabina
* **Archivo:** `transporte_colombia_front/src/presentation/components/EmergencyButton.tsx`.
* **Descripción:** Botón rojo de alta visibilidad para situaciones de riesgo (intento de hurto, volcamiento, emergencia médica) que emite alerta inmediata a la central de despacho.

### Tarea ISA-08: Tarea de Telemetría GPS en Segundo Plano
* **Archivo:** `transporte_colombia_front/src/data/services/telemetry-sync.service.ts`.
* **Descripción:** Configurar `expo-location` y `TaskManager` para registrar la posición del camión cada 30 segundos mientras la ruta esté en estado `en_ruta`.

### Tarea ISA-09: Gestor de Sincronización Automática Offline
* **Archivo:** `transporte_colombia_front/src/data/services/offline-sync.manager.ts`.
* **Descripción:** Detectar cuándo el teléfono pierde señal en cañones o cordilleras, acumular los puntos de telemetría y eventos en SQLite/AsyncStorage, y vaciar la cola automáticamente al recuperar cobertura 4G.

### Tarea ISA-10: Limpieza Segura de Almacenamiento Local en Logout
* **Archivo:** `transporte_colombia_front/src/data/services/auth.storage.ts`.
* **Descripción:** Garantizar que al pulsar "Cerrar sesión" se eliminen de `AsyncStorage` todas las llaves temporales de rutas e incidentes para proteger la privacidad entre turnos de conductores.

---

## 3. Comandos de Verificación

```bash
# Validar sintaxis y cero errores de TypeScript
npm run lint

# Sincronizar en rama individual
git add .
git commit -m "feat(mobile-driver): firma digital, inspeccion preoperacional y offline sync"
git push origin Isabella
```

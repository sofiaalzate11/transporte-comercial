# Matriz de Casos de Prueba de Aceptación — QA Integral

**Task:** SOF-08 · **Versión:** 1.0 · **Fecha:** 2026-11-25 · **Total de casos:** 25

## 1. Credenciales y alcance

| Rol | Correo | Contraseña | Uso |
| :--- | :--- | :--- | :--- |
| Cliente / consulta | `cliente@transporte.com` | `Prueba123!` | Búsqueda de remesas, ETA y novedades |
| Operador central | `operador@transporte.com` | `Prueba123!` | Despachos, manifiesto y tipología vehicular |
| Conductor | `conductor@transporte.com` | `Prueba123!` | Checklists, novedades y entrega con firma |

Respuesta de seguridad para las tres cuentas: `Prueba`.

**Criterio general de aceptación:** toda pantalla muestra errores comprensibles en español, no permite doble envío mientras una operación está en curso y conserva los datos localmente si no hay backend disponible.

## 2. Matriz de casos

| ID | Caso | Perfil | Pasos | Resultado esperado | Prioridad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| QA-01 | Registro de cliente con rol consulta | Nuevo usuario | Registrar nombre, correo, contraseña, pregunta/respuesta y rol "Cliente". | Cuenta creada; mensaje de éxito; login precargado con el correo; `rol = consulta`. | Alta |
| QA-02 | Registro de operador | Nuevo usuario | Repetir registro eligiendo "Operador de central". | `rol = operador`; acceso a creación de despachos. | Alta |
| QA-03 | Registro de conductor | Nuevo usuario | Repetir registro eligiendo "Conductor". | `rol = conductor`; acceso a checklists y POD. | Alta |
| QA-04 | Correo duplicado | Nuevo usuario | Registrar dos veces el mismo correo. | Segundo intento muestra "Este correo ya está registrado" en el campo correo; no se crea otra cuenta. | Alta |
| QA-05 | Login con credenciales de prueba | Los 3 roles | Ingresar cada correo con `Prueba123!`, marcar "Recordarme", reiniciar la app. | Sesión restaurada para los tres roles. Si el correo ya existía con otra contraseña, se repara automáticamente y el login funciona igual. | Crítica |
| QA-06 | Consulta pública por manifiesto válido | Cliente (sin login) | Desde login tocar "Consultar el estado de una remesa", digitar `MAN-10425`. | Modal muestra etapa, ETA, incidentes y último reporte; no se solicita sesión de operador. | Crítica |
| QA-07 | Consulta con formato inválido | Cliente | Digitar `10425` y consultar. | Error: "El código debe tener el formato MAN-XXXXX"; no se ejecuta la búsqueda. | Alta |
| QA-08 | Consulta con derrumbe activo | Cliente | Consultar un código par (ej. `MAN-10424`). | ETA ajustado mayor al base; se listan derrumbe y minutos de impacto. | Alta |
| QA-09 | Consulta sin incidentes | Cliente | Consultar un código impar (ej. `MAN-10423`). | ETA ajustado igual al base; mensaje "Sin incidencias que afecten el tiempo estimado". | Media |
| QA-10 | Cierre y reapertura del modal | Cliente | Consultar, cerrar y volver a abrir. | Búsqueda, error y resultado anteriores se limpian; campo vacío. | Media |
| QA-11 | Inspección pre-operacional conforme | Conductor | Marcar frenos, aceite, llantas, luces y kit; SOAT y RTM vigentes; firmar. | Checklist guardado con `fechaInspeccion`; botón "Iniciar viaje" habilitado. | Crítica |
| QA-12 | Inspección con SOAT vencido | Conductor | Marcar SOAT vencido e intentar iniciar viaje. | Arranca bloqueado; mensaje "SOAT vencido, no es legal iniciar la ruta"; no se crea despacho. | Crítica |
| QA-13 | Prueba de entrega digital completa | Conductor | Capturar firma, nombre y cédula del receptor, observación, 2 fotos y ubicación. | `IProofOfDelivery` completo; entrega cerrada con `fechaHoraEntrega`, latitud y longitud. | Crítica |
| QA-14 | POD sin cédula del receptor | Conductor | Intentar cerrar entrega sin `cedulaReceptor`. | Validación bloquea el cierre y resalta el campo. | Alta |
| QA-15 | POD sin conectividad | Conductor | Cerrar entrega en modo avión y reconectar. | POD queda en cola local; se sincroniza una sola vez al reconectar; no se duplica. | Alta |
| QA-16 | Conductor acepta dos viajes activos | Conductor | Con un viaje `en_ruta`, intentar aceptar un segundo despacho. | Segundo rechazado: "Ya tienes un viaje activo"; el primero permanece intacto. | Crítica |
| QA-17 | Suspensión con motivo justificado | Operador | Suspender ruta indicando "derrumbe en Km 42" y adjuntar reporte INVIAS. | Estado `en_suspension`; motivo y fuente visibles al cliente; ETA recalculado. | Crítica |
| QA-18 | Suspensión sin motivo | Operador | Intentar suspender sin diligenciar el motivo. | Acción bloqueada; mensaje "La suspensión requiere un motivo justificado". | Alta |
| QA-19 | Desconexión en pleno tránsito | Conductor | Activar modo avión durante 10 minutos generando telemetría. | Puntos se almacenan localmente (`pendingSync`); la app sigue operativa y muestra aviso "Sin conexión". | Crítica |
| QA-20 | Reconexión posterior | Conductor | Restaurar red tras QA-19. | Lote se envía una vez; contador `savedCount` coincide con los puntos en cola; la cola se vacía. | Crítica |
| QA-21 | Recálculo automático de ETA ante derrumbe | Operador + Cliente | Registrar incidente `LANDSLIDE` con 60 min de impacto en ruta activa. | `deltaMinutes = 60`; `recalculatedEta` posterior al base; cliente ve el nuevo ETA sin recargar. | Crítica |
| QA-22 | Asignar conductor con viaje activo | Operador | Asignar al conductor de QA-16 otra ruta. | Asignación rechazada; lista de conductores disponibles excluye al ocupado. | Alta |
| QA-23 | Crear despacho con manifiesto y tipología C3S3 | Operador | Crear ruta con manifiesto `MAN-XXXXX`, mercancía refrigerada y vehículo C3S3. | Despacho creado; categoría de peaje V; cálculo de costos usa tarifa V. | Alta |
| QA-24 | Alerta INVIAS de cierre total | Operador | Recibir alerta de `TOTAL_CLOSURE` en corredor activo. | Alerta crítica en bandeja; ruta pasa a `en_suspension`; se propone contingencia. | Crítica |
| QA-25 | Contingencia por cierre total con ruta alterna | Operador + Cliente | Aceptar ruta alterna, notificar al conductor y al cliente. | Nueva ETA comunicada; manifiesto conserva trazabilidad del incidente y del cambio de ruta. | Crítica |

## 3. Registro de ejecución

| Campo | Valor |
| :--- | :--- |
| Entorno | Expo SDK 58 / React Native 0.88 / dispositivo Android e iOS |
| Backend | Modo local para autenticación; API REST para rutas, incidentes y telemetría |
| Evidencia | Captura de pantalla o grabación por caso, con ID QA-XX en el nombre |
| Resultado | Aprobado / Fallido / Bloqueado (adjuntar ticket si es fallido) |

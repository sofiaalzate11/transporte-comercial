# Módulo de Cambios Pendientes y Mejoras (Backlog Técnico)

Este documento registra los hallazgos de usabilidad y requerimientos funcionales detectados durante las pruebas en dispositivo físico. Serán abordados en la siguiente iteración de desarrollo.

---

## 1. Catálogo de Tareas Pendientes

### Tarea 1: Implementación de Cierre de Sesión (*Logout*)
* **Ubicación:** `mobile/app/(tabs)/` y `mobile/src/presentation/stores/auth.store.ts`
* **Descripción del problema:** La aplicación guarda el token en `expo-secure-store`, pero no dispone de un botón visible en la barra superior o en los ajustes para cerrar la sesión activa y retornar a la pantalla de login.
* **Solución técnica planificada:**
  1. Agregar un botón de cierre de sesión en el encabezado de navegación (`headerRight` en `app/(tabs)/_layout.tsx`).
  2. Invocar la función `logout()` de `useAuthStore`, la cual elimina `auth_token` y `user_data` de `SecureStore`.
  3. Redirigir la navegación hacia `/(auth)/login` mediante `router.replace()`.

---

### Tarea 2: Teclado Oculta el Formulario de Acceso (*Keyboard Occlusion*)
* **Ubicación:** `mobile/app/(auth)/login.tsx`
* **Descripción del problema:** Al tocar los campos de texto en dispositivos móviles físicos, el teclado virtual de Android/iOS se despliega sobre los `TextInput` y oculta el botón "Iniciar Sesión".
* **Solución técnica planificada:**
  1. Envolver el formulario en un componente `KeyboardAvoidingView` de React Native configurado con:
     * `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`
  2. Incorporar un `ScrollView` con `keyboardShouldPersistTaps="handled"` y `contentContainerStyle={{ flexGrow: 1 }}` para permitir desplazamiento táctil cuando el teclado esté abierto.

---

### Tarea 3: Trazado Vial Real por Carreteras (OSRM) en vez de Línea Recta
* **Ubicación:** `mobile/app/(tabs)/mapa.tsx` y `backend/src/routes/`
* **Descripción del problema:** Actualmente el mapa en Leaflet traza una polilínea geodésica recta entre el punto de origen (A) y el destino (B), lo cual no refleja el trazado curvilíneo real de las carreteras colombianas.
* **Solución técnica planificada:**
  1. Conectar con el servicio de ruteo vehicular de OpenStreetMap (**OSRM**):
     * Endpoint: `https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson`
  2. Obtener el arreglo detallado de coordenadas geográficas de la red vial.
  3. Dibujar la ruta mediante `L.geoJSON()` en Leaflet siguiendo las curvas, pasos de montaña y peajes.
  4. Mantener la lógica de coloreado condicional (rojo si intersecta incidentes de INVIAS, azul si está despejada).

---

## 2. Matriz de Prioridad y Estimación

| ID | Tarea técnica | Componente | Prioridad | Complejidad |
| :--- | :--- | :--- | :--- | :--- |
| **PEND-01** | Botón y flujo de Cierre de Sesión | Presentación / Auth | Media | Baja |
| **PEND-02** | `KeyboardAvoidingView` en Login | Presentación / UI | Alta | Baja |
| **PEND-03** | Ruteo por carretera real con OSRM | Cartografía / Leaflet | Alta | Media |

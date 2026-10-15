# Directivas de Contexto y Mapeo de Skills: Proyecto Transporte Colombia

## 1. Mapeo de Skills por Contexto de Uso

| Skill | Cuándo activarla | Acción o comando en el proyecto |
| :--- | :--- | :--- |
| `agent-strict-mode` | Todo el ciclo de desarrollo | Respuestas sin saludos, sin emojis, frases cortas y factuales |
| `android-cli` | Configuración de emuladores y APKs | Usar `android sdk`, `android emulator`, `android run`, `android screen` |
| `antigravity-guide` | Configuración del IDE y slash commands | Consultar comandos `/goal`, `/plan` y variables de entorno |
| `agy-customizations` | Creación de reglas y extensiones | Estructurar `.agents/rules/` y scripts en el repositorio |

---

## 2. Reglas del Stack Tecnológico
* Framework: React Native 0.76+ con Nueva Arquitectura activada.
* Toolchain: Expo SDK 52+ con Development Builds continuos.
* Enrutador: expo-router v4 en directorio `app/`.
* Base de datos: expo-sqlite bajo esquema relacional transaccional.
* Seguridad: expo-secure-store usando Keystore y Keychain nativos.
* Mapas y GIS: @maplibre/maplibre-react-native y @turf/turf.
* Estado: Zustand para sesión y TanStack Query v5 para red.

---

## 3. Reglas Arquitectónicas por Capas
* **Capa 1 Presentación (`app/`, `src/presentation/`):**
  * Solo interfaces visuales y captura de eventos.
  * Prohibido ejecutar consultas SQL o cálculos matemáticos aquí.
* **Capa 2 Lógica de Negocio (`src/domain/`):**
  * Casos de uso puros y fórmulas de retraso en TypeScript.
  * Prohibido importar dependencias de React Native o SQLite.
* **Capa 3 Datos e Infraestructura (`src/data/`):**
  * Implementa repositorios, clientes HTTP y acceso a SQLite.
  * Transforma respuestas externas a entidades de dominio mediante mappers.

---

## 4. Fuentes de Datos Oficiales de Colombia
* INVIAS HERMES #767: ArcGIS FeatureServer para cierres y derrumbes.
* Datos Abiertos: SODA REST API para peajes y red vial.
* IDEAM: Alertas climáticas por remoción en masa.

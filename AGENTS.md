# Directivas de Contexto y Mapeo de Skills: Proyecto Transporte Colombia

## 1. Estructura Raíz del Repositorio
* `backend/`: API REST en NestJS con TypeScript y TypeORM/PostGIS.
* `mobile/`: Aplicación React Native con Expo SDK 52+ y New Architecture.
* `shared/`: Tipos, interfaces y contratos TypeScript compartidos.
* `docs/`: Documentación técnica de arquitectura y diseño.

---

## 2. Mapeo de Skills por Contexto de Uso

| Skill | Ámbito de ejecución | Comando o acción en el proyecto |
| :--- | :--- | :--- |
| `agent-strict-mode` | Todo el ciclo de desarrollo | Respuestas sin saludos, sin emojis, frases cortas y factuales |
| `android-cli` | Entorno móvil en `mobile/` | Usar `android sdk`, `android emulator`, `android run`, `android screen` |
| `antigravity-guide` | Configuración del IDE | Gestión de slash commands `/plan`, `/goal` |
| `agy-customizations` | Configuración de reglas | Mantenimiento de `.agents/` y directivas del repositorio |

---

## 3. Reglas Técnicas del Backend (NestJS)
* Framework: NestJS 10+ con TypeScript estricto.
* Base de datos: PostgreSQL 16 con extensión PostGIS.
* ORM: TypeORM configurado con soporte geoespacial.
* Autenticación: Passport-JWT con validación de roles en Guards.
* Módulos: auth, users, routes, road-incidents, telemetry, delay-engine.

---

## 4. Reglas Técnicas del Móvil (React Native)
* Framework: React Native 0.76+ con Bridgeless Mode.
* Toolchain: Expo SDK 52+ con Development Builds continuos.
* Enrutador: expo-router v4 en directorio `mobile/app/`.
* Persistencia local: expo-sqlite bajo esquema relacional.
* Seguridad: expo-secure-store mediante Keystore y Keychain.
* Mapas: @maplibre/maplibre-react-native y @turf/turf.

# AGENTS.md — Transporte Colombia mobile

## Structure

- Single Expo app at repo root; there is no `mobile/`, `backend/`, or root `shared/`. Backend is the external sibling `../Transporte-Comercial-BACK`.
- expo-router entry is `expo-router/entry`; file routes live in `app/` (`(auth)`, `(tabs)`). `app/_layout.tsx` gates navigation on `useAuth().cargando`.
- TypeScript is strict; aliases are `@/*` -> `src/*` and `@shared/*` -> `src/shared/*`.

## Commands

- In this Windows environment, run npm/npx through `cmd /c`; PowerShell blocks `npm.ps1`.
- Verification is only `cmd /c npm run lint` (`tsc --noEmit`). There are no test, CI, formatter, or codegen scripts.
- Dev: `cmd /c npx expo start` or `cmd /c npm start` (`--go`); web: `cmd /c npm run web`; install: `cmd /c npm install --legacy-peer-deps`.
- `start-dev.ps1` / `start-dev.bat` launch the sibling backend plus Expo Go; they require `../Transporte-Comercial-BACK`.

## Runtime facts

- package.json/app.json are the version source of truth: Expo SDK 58, RN 0.88, React 19.3, `newArchEnabled: true`.
- Auth is local, not backend: `src/data/services/auth.storage.ts` uses AsyncStorage plus SHA-256(salt:value). The demo accounts self-repair; do not revert them to `/auth/mobile/*` API calls.
- Demo logins: `cliente@`, `operador@`, `conductor@transporte.com` / `Prueba123!`; recovery answer `Prueba`.
- `expo-secure-store` falls back to AsyncStorage on web.
- API base comes from `EXPO_PUBLIC_API_URL`; defaults are `localhost:3000` (web), Expo host IP (device), `10.0.2.2` (Android emulator). `.env` is gitignored; `.env.example` exists.
- SQLite uses WAL and per-user DB files on native; web uses AsyncStorage keys `@web_routes` / `@web_incidents`. Keep `wasm` in `metro.config.js` for expo-sqlite web.
- Background telemetry task `background-location-task` uses expo-task-manager/location at 30s/100m and needs the location permissions declared in app.json.
- Map uses `react-native-webview` + Leaflet CDN, not `@maplibre` (not installed).
- Delay logic is pure Haversine in `src/domain/use-cases/calculate-delay.usecase.ts`.

## Workflow

- Branches by owner: `Sofia` (shared types/docs), `Carlos` (backend), `Isabella` (domain/persistence), `Duber` (routes/UI).

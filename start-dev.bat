@echo off
echo ========================================================
echo   Iniciando Transporte Colombia (Backend + Mobile)
echo ========================================================

start "Backend NestJS (Puerto 3000)" cmd /k "cd /d %~dp0..\Transporte-Comercial-BACK && npm run start:dev"
start "Mobile React Native (Expo Go)" cmd /k "cd /d %~dp0 && npx expo start --go"

echo Ambos servicios fueron lanzados en ventanas independientes.

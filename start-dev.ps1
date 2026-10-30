# Script para iniciar Backend y Mobile simultáneamente en ventanas separadas
Write-Host "Iniciando Transporte Colombia..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\..\Transporte-Comercial-BACK'; Write-Host '--- Backend NestJS ---' -ForegroundColor Yellow; npm run start:dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; Write-Host '--- Mobile Expo Go ---' -ForegroundColor Green; npx expo start --go"

Write-Host "Backend y Mobile iniciados en ventanas dedicadas." -ForegroundColor Green

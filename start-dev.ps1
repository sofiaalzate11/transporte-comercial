# Script para iniciar Backend y Mobile simultáneamente en ventanas separadas
Write-Host "Iniciando Transporte Colombia..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; Write-Host '--- Backend NestJS ---' -ForegroundColor Yellow; npm run start:dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\mobile'; Write-Host '--- Mobile Expo Go ---' -ForegroundColor Green; npx expo start --go"

Write-Host "Backend y Mobile iniciados en ventanas dedicadas." -ForegroundColor Green

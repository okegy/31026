# Aura AI Executive Assistant - Start Script
# This script will start the development server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Aura AI Executive Assistant" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeInstalled) {
    Write-Host "Error: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please run SETUP.ps1 first to install dependencies." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Dependencies not found. Installing..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "The application will open in your browser automatically." -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host ""

npm run dev

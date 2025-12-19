@echo off
echo ========================================
echo Aura AI Executive Assistant - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Visit https://nodejs.org/
    echo 2. Download and install the LTS version
    echo 3. Restart this script
    echo.
    echo Or run SETUP.ps1 in PowerShell as Administrator for automated installation
    pause
    exit /b 1
)

echo Node.js found!
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

echo Starting development server...
echo.
echo The application will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

call npm run dev

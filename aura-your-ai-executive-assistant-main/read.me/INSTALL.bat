@echo off
title Aura AI Executive Assistant - One-Click Installer
color 0B

echo.
echo ============================================================
echo          AURA AI EXECUTIVE ASSISTANT INSTALLER
echo ============================================================
echo.
echo This installer will:
echo   1. Check if Node.js is installed
echo   2. Install project dependencies
echo   3. Verify the setup
echo   4. Start the application
echo.
echo ============================================================
echo.

REM Check if Node.js is installed
echo [1/4] Checking for Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [X] Node.js is NOT installed!
    echo.
    echo ============================================================
    echo          MANUAL INSTALLATION REQUIRED
    echo ============================================================
    echo.
    echo Please install Node.js first:
    echo.
    echo   Option 1: Automated Installation
    echo   ---------------------------------
    echo   1. Open PowerShell as Administrator
    echo   2. Navigate to this folder
    echo   3. Run: .\SETUP.ps1
    echo.
    echo   Option 2: Manual Installation
    echo   -----------------------------
    echo   1. Visit: https://nodejs.org/
    echo   2. Download the LTS version
    echo   3. Install and restart this script
    echo.
    echo ============================================================
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found!
node --version
echo.

REM Check if dependencies are installed
echo [2/4] Checking dependencies...
if not exist "node_modules" (
    echo [!] Dependencies not found. Installing...
    echo.
    echo This may take 2-5 minutes. Please wait...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [X] Failed to install dependencies!
        echo.
        echo Please check the error messages above and try again.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed successfully!
) else (
    echo [OK] Dependencies already installed!
)
echo.

REM Verify .env file exists
echo [3/4] Verifying configuration...
if not exist ".env" (
    echo [X] .env file not found!
    echo.
    echo The .env file is required for backend connection.
    echo Please ensure the .env file exists in this directory.
    echo.
    pause
    exit /b 1
)
echo [OK] Configuration file found!
echo.

REM Display success message
echo [4/4] Setup complete!
echo.
echo ============================================================
echo          INSTALLATION SUCCESSFUL!
echo ============================================================
echo.
echo Your Aura AI Executive Assistant is ready to run!
echo.
echo Starting the application...
echo.
echo The app will open at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.
echo ============================================================
echo.

timeout /t 3 /nobreak >nul

REM Start the development server
call npm run dev

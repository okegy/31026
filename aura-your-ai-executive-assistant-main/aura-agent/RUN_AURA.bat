@echo off
echo ========================================
echo    AURA - AI Executive Assistant
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
pip install -r requirements.txt --quiet

echo.
echo ========================================
echo Starting AURA Backend...
echo ========================================
echo.

python main.py

pause

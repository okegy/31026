@echo off
echo ========================================
echo MedSchedule AI - Complete OAuth Setup
echo ========================================
echo.
echo STEP 1: Opening authorization URL...
echo.

start "" "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=740499726436-buv6032jdt7vbdcirjieb87okgv99n57.apps.googleusercontent.com&redirect_uri=http%%3A%%2F%%2Flocalhost%%3A8080&scope=https%%3A%%2F%%2Fwww.googleapis.com%%2Fauth%%2Fcalendar+https%%3A%%2F%%2Fwww.googleapis.com%%2Fauth%%2Fgmail.send&access_type=offline&include_granted_scopes=true&prompt=consent"

echo.
echo Browser opened! Please:
echo 1. Sign in to your Google account
echo 2. Click "Allow" for permissions
echo 3. Copy the authorization code (starts with "4/")
echo.
echo STEP 2: Enter your authorization code below:
echo.
set /p auth_code="Paste your code here: "

if "%auth_code%"=="" (
    echo No code provided. Exiting.
    pause
    exit /b 1
)

echo.
echo STEP 3: Processing your code...
echo %auth_code%> auth_code.txt

python direct_oauth_fix.py

echo.
echo ========================================
echo Setup complete! Testing Google integration...
echo ========================================
python test_google_auth.py

pause

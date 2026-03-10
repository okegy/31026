@echo off
echo ========================================
echo MedSchedule AI - CHROME BROWSER SETUP
echo ========================================
echo.

echo Using your NEW credentials in Google Chrome:
echo Client ID: 904084363443-ml7kbg967mth9gi54habhpugbumg6cm7.apps.googleusercontent.com
echo.

echo STEP 1: Opening Google Chrome...
echo.

REM Try to open in Chrome specifically
"C:\Program Files\Google\Chrome\Application\chrome.exe" "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=904084363443-ml7kbg967mth9gi54habhpugbumg6cm7.apps.googleusercontent.com&redirect_uri=http%%3A%%2F%%2Flocalhost%%3A8080&scope=https%%3A%%2F%%2Fwww.googleapis.com%%2Fauth%%2Fcalendar+https%%3A%%2F%%2Fwww.googleapis.com%%2Fauth%%2Fgmail.send&access_type=offline&include_granted_scopes=true&prompt=consent" 2>nul

if %errorlevel% neq 0 (
    echo Trying alternative Chrome path...
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=904084363443-ml7kbg967mth9gi54habhpugbumg6cm7.apps.googleusercontent.com&redirect_uri=http%%3A%%2F%%2Flocalhost%%3A8080&scope=https%%3A%%2F%%2Fwww.googleapis.com%%2Fauth%%2Fcalendar+https%%3A%%2F%%2Fwww.googleapis.com%%2Fauth%%2Fgmail.send&access_type=offline&include_granted_scopes=true&prompt=consent" 2>nul
)

if %errorlevel% neq 0 (
    echo Chrome not found, opening in default browser...
    start "" "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=904084363443-ml7kbg967mth9gi54habhpugbumg6cm7.apps.googleusercontent.com&redirect_uri=http%%3A%%2F%%2Flocalhost%%3A8080&scope=https%%3A%%2F%%2Fwww.googleapis.com%%2Fauth%%2Fcalendar+https%%3A%%2F%%2Fwww.googleapis.com%%2Fauth%%2Fgmail.send&access_type=offline&include_granted_scopes=true&prompt=consent"
)

echo.
echo ✅ Browser opened! Please:
echo 1. Use Google Chrome (opened automatically)
echo 2. Sign in to your Google account (use Incognito if needed)
echo 3. Click "Allow" for Calendar and Gmail access
echo 4. Copy the authorization code from the URL
echo.
echo STEP 2: Enter your authorization code:
echo.
set /p auth_code="Paste your code here (starts with 4/): "

if "%auth_code%"=="" (
    echo No code provided. Exiting.
    pause
    exit /b 1
)

echo.
echo STEP 3: Setting up your refresh token via Chrome...
echo %auth_code%> chrome_auth_code.txt

python chrome_oauth_setup.py

echo.
echo ========================================
echo CHROME SETUP COMPLETE! Testing integration...
echo ========================================
python test_google_auth.py

echo.
echo 🎉 If you see "GOOGLE INTEGRATION 100% WORKING!" above, you're all set!
echo Your MedSchedule AI is now fully functional via Chrome!
echo.
pause

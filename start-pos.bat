@echo off
echo ========================================
echo POS Application - Complete Setup
echo ========================================
echo.
echo This script will start both Backend and Frontend
echo.
echo Backend will run on: http://localhost:8080
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop the servers
echo.
pause

start "POS Backend (Java)" cmd /k "%~dp0start-backend.bat"
timeout /t 5 /nobreak >nul

start "POS Frontend (React)" cmd /k "%~dp0start-frontend.bat"

echo.
echo Both services are starting in separate windows...
echo.
echo Once both are running, open your browser and go to:
echo http://localhost:3000
echo.
pause

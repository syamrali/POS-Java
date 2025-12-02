@echo off
echo ========================================
echo Starting POS Application - Java Backend
echo ========================================
echo.

cd backend-java

echo Checking if Maven is installed...
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven is not installed or not in PATH!
    echo Please install Maven from https://maven.apache.org/download.cgi
    echo.
    pause
    exit /b 1
)

echo Checking if Java is installed...
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java is not installed or not in PATH!
    echo Please install Java 17 or higher from https://adoptium.net/
    echo.
    pause
    exit /b 1
)

java -version 2>&1 | find "version" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java is not properly configured!
    echo.
    pause
    exit /b 1
)

echo.
echo Starting Java Spring Boot Backend on http://localhost:8080
echo Please wait...
echo.

mvn spring-boot:run

pause

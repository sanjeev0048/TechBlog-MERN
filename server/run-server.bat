@echo off
title TechPulse Blog - Backend API Server
cd /d "%~dp0"

echo ===================================================
echo   TechPulse Express.js & MongoDB API Server
echo ===================================================
echo.

if not exist "node_modules\" (
    echo [1/3] Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies. Ensure Node.js is installed.
        pause
        exit /b 1
    )
    echo.
    echo [2/3] Seeding initial admin and categories into MongoDB...
    call npm run seed:all
) else (
    echo [1/2] Dependencies already installed.
)

echo.
echo Starting REST API server on port 5000...
echo.
call npm run dev
pause

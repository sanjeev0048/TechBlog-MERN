@echo off
title TechPulse Blog - Starting Application
cd /d "%~dp0"

echo ===================================================
echo   TechPulse - Corporate Engineering Blog & CMS
echo ===================================================
echo.

if not exist "node_modules\" (
    echo [1/2] Installing dependencies (first run only)...
    call npm install
    if errorlevel 1 (
        echo Error installing dependencies. Please ensure Node.js is installed.
        pause
        exit /b %errorlevel%
    )
) else (
    echo [1/2] Dependencies already installed.
)

echo.
echo [2/2] Launching Vite development server at http://localhost:3000 ...
echo.
call npm run dev
pause

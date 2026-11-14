@echo off
chcp 65001 >nul
title SciNexa 3D Platform - Offline Server
cd /d "%~dp0"

echo =====================================================================
echo    SciNexa Platform — Offline Local Launcher
echo    Interactive 3D Science Laboratories — ISEF 2026
echo =====================================================================
echo.

if not exist "dist\index.html" (
    echo [1/2] Building static dist...
    call npm run build
) else (
    echo [1/2] Built dist assets verified.
)

echo [2/2] Launching local server and opening browser...
start http://localhost:3000

echo.
echo =====================================================================
echo  SciNexa is running 100%% OFFLINE on your machine!
echo  URL: http://localhost:3000
echo.
echo  * Keep this terminal window open while using the platform.
echo =====================================================================
echo.

node offline_server.cjs
pause

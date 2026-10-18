@echo off
chcp 65001 >nul
title SciNexa Virtual Laboratory Engine - USB Portable Launcher
cd /d "%~dp0"

echo ===================================================================
echo     SciNexa Virtual Laboratory Engine - Offline Portable Launcher
echo ===================================================================
echo.
echo [1/2] Initializing local zero-dependency Web Server...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\offline_server.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Fallback: Trying Python or Node local launcher...
    where python >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        cd dist
        start http://localhost:8000
        python -m http.server 8000
    ) else (
        where npx >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            npx serve -s dist -l 5173
        ) else (
            echo Error: Could not launch local server.
            pause
        )
    )
)

@echo off
chcp 65001 >nul
title SciNexa Offline Virtual Laboratories - USB Launcher
cd /d "%~dp0"

echo ===================================================================
echo     SciNexa Virtual Laboratory Engine - USB Portable Launcher
echo ===================================================================
echo.
echo [1/2] Preparing offline environment and stopping old instances...
taskkill /f /im SciNexa.exe >nul 2>&1
echo [2/2] Starting local zero-dependency offline server...

if exist "%~dp0scripts\offline_server.ps1" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\offline_server.ps1"
    goto :done
)

if exist "%~dp0scinexa\scripts\offline_server.ps1" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scinexa\scripts\offline_server.ps1"
    goto :done
)

:: Direct fallback in default browser
if exist "%~dp0dist\index.html" (
    start "" "%~dp0dist\index.html"
    goto :done
)

if exist "%~dp0scinexa\dist\index.html" (
    start "" "%~dp0scinexa\dist\index.html"
    goto :done
)

:done

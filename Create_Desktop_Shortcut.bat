@echo off
title SciNexa - Create Desktop Shortcut
echo ====================================================
echo        SciNexa Platform - Desktop Setup
echo ====================================================
echo.
echo Installing SciNexa Shortcut to your Windows Desktop...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\create_shortcut.ps1"

echo.
echo ====================================================
echo  [DONE] SciNexa icon has been placed on your Desktop!
echo ====================================================
pause

@echo off
chcp 65001 >nul
title SciNexa 3D Platform - Offline Server
cd /d "%~dp0"

echo =====================================================================
echo    SciNexa Platform — التشغيل المحلي الأوفلاين بدون إنترنت
echo    Interactive 3D Science Laboratories — ISEF 2026
echo =====================================================================
echo.

if not exist "dist\index.html" (
    echo [1/2] بناء ملفات المنصة لأول مرة (Building static dist)...
    call npm run build
) else (
    echo [1/2] تم التحقق من وجود ملفات المنصة المجهزة بنجاح.
)

echo [2/2] بدء الخادم المحلي وفتح المنصة في المتصفح...
start http://localhost:3000

echo.
echo =====================================================================
echo  المنصة تعمل الآن محلياً 100%% على جهازك بدون الحاجة للإنترنت!
echo  الرابط: http://localhost:3000
echo.
echo  * لا تغلق هذه النافذة السوداء طالما أنك تستخدم المنصة.
echo =====================================================================
echo.

node offline_server.cjs
pause

# SciNexa Zero-Dependency Offline Server
# Runs on any Windows machine using built-in PowerShell without needing Node or Python

param (
    [int]$Port = 5173,
    [string]$DistPath = ""
)

if ([string]::IsNullOrEmpty($DistPath)) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $parentDir = Split-Path -Parent $scriptDir
    $DistPath = Join-Path $parentDir "dist"
    if (-not (Test-Path $DistPath)) {
        $DistPath = $parentDir
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       SciNexa Virtual Laboratory Engine - USB Mode       " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Root Directory: $DistPath" -ForegroundColor Gray
Write-Host "Server URL:     http://localhost:$Port" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".svg"  = "image/svg+xml"
    ".glb"  = "model/gltf-binary"
    ".gltf" = "model/gltf+json"
    ".wasm" = "application/wasm"
    ".ico"  = "image/x-icon"
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    $Port = $Port + 1
    $prefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "Launching default web browser..." -ForegroundColor Yellow
Start-Process "http://localhost:$Port"

Write-Host "SciNexa is running! (Press Ctrl+C in this window to stop)" -ForegroundColor Green

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $relPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($relPath)) {
            $relPath = "index.html"
        }

        # URL decode
        $relPath = [System.Uri]::UnescapeDataString($relPath)
        $filePath = Join-Path $DistPath $relPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            if ($mime.ContainsKey($ext)) {
                $response.ContentType = $mime[$ext]
            } else {
                $response.ContentType = "application/octet-stream"
            }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # Single Page Application (SPA) Fallback to index.html
            $spaFallback = Join-Path $DistPath "index.html"
            if (Test-Path $spaFallback) {
                $response.ContentType = "text/html; charset=utf-8"
                $bytes = [System.IO.File]::ReadAllBytes($spaFallback)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
            }
        }
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}

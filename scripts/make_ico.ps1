Add-Type -AssemblyName System.Drawing
$pngPath = Join-Path (Get-Location) "public\favicon.png"
if (-not (Test-Path $pngPath)) {
    $pngPath = Join-Path (Get-Location) "public\logo.png"
}
$bmp = [System.Drawing.Bitmap]::FromFile($pngPath)
$resized = New-Object System.Drawing.Bitmap(64, 64)
$g = [System.Drawing.Graphics]::FromImage($resized)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($bmp, 0, 0, 64, 64)

$hIcon = $resized.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$outPath = Join-Path (Get-Location) "public\scinexa.ico"
$stream = New-Object System.IO.FileStream($outPath, [System.IO.FileMode]::Create)
$icon.Save($stream)
$stream.Close()
$icon.Dispose()
$g.Dispose()
$resized.Dispose()
$bmp.Dispose()
Write-Host "Created $outPath successfully"

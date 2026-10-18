$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "SciNexa.lnk"
$targetExe = Join-Path (Get-Location) "SciNexa.exe"
$iconPath = Join-Path (Get-Location) "public\scinexa.ico"
$workDir = (Get-Location).Path

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetExe
$shortcut.WorkingDirectory = $workDir
$shortcut.IconLocation = "$iconPath,0"
$shortcut.Description = "SciNexa Interactive Science Platform"
$shortcut.Save()

Write-Host "Created Desktop Shortcut successfully at: $shortcutPath"

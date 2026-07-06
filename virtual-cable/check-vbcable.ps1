$ErrorActionPreference = "Stop"

Write-Host "MemeBlip VB-CABLE diagnostic" -ForegroundColor Cyan

$devices = Get-CimInstance Win32_SoundDevice | Where-Object {
  $_.Name -match "VB-Audio|CABLE Input|CABLE Output|VB-CABLE"
}

if (!$devices) {
  Write-Host "VB-CABLE was not detected by Windows." -ForegroundColor Yellow
  Write-Host "Install it with: npm run cable:install"
  exit 1
}

$devices | ForEach-Object {
  Write-Host "Found: $($_.Name) [$($_.Status)]"
}

Write-Host "Expected route after install:" -ForegroundColor Green
Write-Host "  MemeBlip route/output: CABLE Input"
Write-Host "  Target app microphone: CABLE Output"
Write-Host "  Your monitor output: normal headphones/speakers"

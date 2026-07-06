$ErrorActionPreference = "Stop"

Write-Host "Opening Windows app volume/device routing..." -ForegroundColor Cyan
Write-Host "Recommended setup:" -ForegroundColor Green
Write-Host "  Browser/game/music app output: CABLE Input"
Write-Host "  Meet/Discord/Valorant speaker output: your normal headphones/speakers"
Write-Host "  Meet/Discord/Valorant microphone: CABLE Output"
Write-Host ""
Write-Host "This sends selected laptop/app sounds into the call without routing the call's own speaker audio back into the mic."
Start-Process "ms-settings:apps-volume"

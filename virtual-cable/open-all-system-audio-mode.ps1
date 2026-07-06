$ErrorActionPreference = "Stop"

Write-Host "Opening Windows sound output settings..." -ForegroundColor Cyan
Write-Host "All-system mode setup:" -ForegroundColor Yellow
Write-Host "  Windows output device: CABLE Input"
Write-Host "  Target app microphone: CABLE Output"
Write-Host "  Target app speaker: your normal headphones/speakers, if the app allows per-app output"
Write-Host ""
Write-Host "Warning: if meeting/call audio is also routed into CABLE Input, other participants may hear echo/feedback."
Write-Host "Use app-specific routing when possible."
Start-Process "ms-settings:sound"

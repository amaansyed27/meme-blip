$ErrorActionPreference = "Stop"

Write-Host "MemeBlip driver prerequisites" -ForegroundColor Cyan
Write-Host "This opens the required Microsoft installers. The driver build needs Visual Studio C++ tools, Windows SDK, and WDK."

if (Get-Command winget -ErrorAction SilentlyContinue) {
  Write-Host "Opening Visual Studio Build Tools installer through winget..."
  winget install --id Microsoft.VisualStudio.2022.BuildTools -e --source winget --override "--passive --wait --add Microsoft.VisualStudio.Workload.VCTools --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --add Microsoft.VisualStudio.Component.Windows11SDK.26100 --includeRecommended"
} else {
  Write-Host "winget was not found. Open this page manually: https://visualstudio.microsoft.com/visual-cpp-build-tools/"
}

Write-Host "Open the Microsoft WDK page and install the matching WDK for your Visual Studio/SDK version:"
Write-Host "https://learn.microsoft.com/en-us/windows-hardware/drivers/download-the-wdk"
Start-Process "https://learn.microsoft.com/en-us/windows-hardware/drivers/download-the-wdk"

Write-Host "After installing prerequisites, close/reopen PowerShell and run: npm run driver:build"

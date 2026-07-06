$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\..\.."
$DriverDir = Join-Path $Root "driver"
$VendorDir = Join-Path $DriverDir "vendor"
$SamplesDir = Join-Path $VendorDir "Windows-driver-samples"
$SysvadDir = Join-Path $SamplesDir "audio\sysvad"

if (!(Get-Command git -ErrorAction SilentlyContinue)) {
  throw "git is required to bootstrap the SysVAD driver source."
}

New-Item -ItemType Directory -Force -Path $VendorDir | Out-Null

if (!(Test-Path $SamplesDir)) {
  git clone --depth 1 https://github.com/microsoft/Windows-driver-samples.git $SamplesDir
} else {
  Push-Location $SamplesDir
  git pull --ff-only
  Pop-Location
}

if (!(Test-Path $SysvadDir)) {
  throw "SysVAD source was not found at $SysvadDir"
}

Write-Host "SysVAD source ready: $SysvadDir"
Write-Host "Next: powershell -ExecutionPolicy Bypass -File driver/scripts/build-driver.ps1"

$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\..\.."
$DriverDir = Join-Path $Root "driver"
$VendorDir = Join-Path $DriverDir "vendor"
$SamplesDir = Join-Path $VendorDir "Windows-driver-samples"
$SysvadDir = Join-Path $SamplesDir "audio\sysvad"
$WilDir = Join-Path $SamplesDir "wil"

if (!(Get-Command git -ErrorAction SilentlyContinue)) {
  throw "git is required to bootstrap the SysVAD driver source."
}

New-Item -ItemType Directory -Force -Path $VendorDir | Out-Null

if (!(Test-Path $SamplesDir)) {
  git clone --depth 1 https://github.com/microsoft/Windows-driver-samples.git $SamplesDir
} else {
  Push-Location $SamplesDir
  git pull --ff-only
  git submodule update --init --recursive --depth 1
  Pop-Location
}

if (!(Test-Path (Join-Path $WilDir "include\wil\com.h"))) {
  Write-Host "Microsoft WIL headers not found. Cloning WIL into Windows-driver-samples/wil..."
  if (Test-Path $WilDir) { Remove-Item -Recurse -Force $WilDir }
  git clone --depth 1 https://github.com/microsoft/wil.git $WilDir
}

if (!(Test-Path $SysvadDir)) {
  throw "SysVAD source was not found at $SysvadDir"
}

if (!(Test-Path (Join-Path $WilDir "include\wil\com.h"))) {
  throw "WIL header wil\com.h was not found after bootstrap."
}

Write-Host "SysVAD source ready: $SysvadDir"
Write-Host "WIL headers ready: $WilDir"
Write-Host "Next: powershell -ExecutionPolicy Bypass -File driver/scripts/build-driver.ps1"

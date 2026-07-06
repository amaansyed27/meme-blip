$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\..\.."
$PackageRoot = Join-Path $Root "driver\out\memeblip-virtual-mic"

function Assert-Admin {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  if (!$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Run this script from an elevated PowerShell window."
  }
}

Assert-Admin

if (!(Test-Path $PackageRoot)) {
  throw "Driver package folder not found: $PackageRoot. Build/package the driver first."
}

$inf = Get-ChildItem $PackageRoot -Filter *.inf -Recurse | Select-Object -First 1
if (!$inf) {
  throw "No INF file found under $PackageRoot."
}

Write-Host "Installing MemeBlip virtual mic driver package: $($inf.FullName)"
pnputil /add-driver $inf.FullName /install
Write-Host "Install command finished. Check Windows Sound settings for MemeBlip Virtual Mic."

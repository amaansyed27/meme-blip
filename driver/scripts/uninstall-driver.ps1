$ErrorActionPreference = "Stop"

function Assert-Admin {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  if (!$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Run this script from an elevated PowerShell window."
  }
}

Assert-Admin

$drivers = pnputil /enum-drivers | Select-String -Pattern "MemeBlip|TabletAudioSample|SysVAD" -Context 4,4
if (!$drivers) {
  Write-Host "No obvious MemeBlip/SysVAD driver package found. Open Device Manager if manual cleanup is needed."
  exit 0
}

Write-Host $drivers
Write-Host "Use pnputil /delete-driver oemXX.inf /uninstall /force for the exact published name shown above."

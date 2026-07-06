$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\..\.."
$SysvadDir = Join-Path $Root "driver\vendor\Windows-driver-samples\audio\sysvad"
$Solution = Join-Path $SysvadDir "sysvad.sln"
$OutDir = Join-Path $Root "driver\out"
$PackageSource = Join-Path $SysvadDir "x64\Debug\package"
$PackageTarget = Join-Path $OutDir "memeblip-virtual-mic"

function Find-MSBuild {
  $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
  if (Test-Path $vswhere) {
    $installPath = & $vswhere -latest -products * -requires Microsoft.Component.MSBuild -property installationPath
    if ($installPath) {
      $candidate = Join-Path $installPath "MSBuild\Current\Bin\MSBuild.exe"
      if (Test-Path $candidate) { return $candidate }
    }
  }

  $candidates = @(
    "${env:ProgramFiles}\Microsoft Visual Studio\2026\Community\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles}\Microsoft Visual Studio\2026\Professional\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles}\Microsoft Visual Studio\2026\Enterprise\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles}\Microsoft Visual Studio\2026\BuildTools\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles}\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles}\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles}\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles}\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe"
  )

  return ($candidates | Where-Object { Test-Path $_ } | Select-Object -First 1)
}

function Test-WdkHeaders {
  $kitsRoot = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\Include"
  if (!(Test-Path $kitsRoot)) { return $false }
  $wdm = Get-ChildItem $kitsRoot -Filter "wdm.h" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
  $portcls = Get-ChildItem $kitsRoot -Filter "portcls.h" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
  return [bool]($wdm -and $portcls)
}

if (!(Test-Path $Solution)) {
  throw "SysVAD solution not found. Run npm run driver:bootstrap first."
}

$msbuild = Find-MSBuild
if (!$msbuild) {
  Write-Host "MSBuild was not found." -ForegroundColor Red
  Write-Host "Install Visual Studio Build Tools with Desktop development with C++ and install the Windows Driver Kit."
  Write-Host "Then rerun: npm run driver:build"
  Write-Host "Helper: npm run driver:prereqs"
  throw "Missing Visual Studio MSBuild / C++ driver build environment."
}

if (!(Test-WdkHeaders)) {
  Write-Host "WDK kernel headers were not found. Missing files include wdm.h and/or portcls.h." -ForegroundColor Red
  Write-Host "Install the Windows Driver Kit and make sure its Visual Studio integration is selected."
  Write-Host "After install, close/reopen PowerShell and rerun: npm run driver:build"
  throw "Missing WDK kernel headers."
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
Write-Host "Using MSBuild: $msbuild"
& $msbuild $Solution /m /p:Configuration=Debug /p:Platform=x64
if ($LASTEXITCODE -ne 0) {
  throw "MSBuild failed with exit code $LASTEXITCODE. The driver package was not built."
}

if (!(Test-Path $PackageSource)) {
  throw "MSBuild succeeded but package output was not found: $PackageSource"
}

if (Test-Path $PackageTarget) {
  Remove-Item -Recurse -Force $PackageTarget
}
New-Item -ItemType Directory -Force -Path $PackageTarget | Out-Null
Copy-Item -Recurse -Force (Join-Path $PackageSource "*") $PackageTarget

Write-Host "Driver build finished."
Write-Host "Package copied to: $PackageTarget"
Write-Host "Next: npm run driver:install from elevated PowerShell."

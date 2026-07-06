$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\..\.."
$SysvadDir = Join-Path $Root "driver\vendor\Windows-driver-samples\audio\sysvad"
$Solution = Join-Path $SysvadDir "sysvad.sln"
$OutDir = Join-Path $Root "driver\out"

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

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
Write-Host "Using MSBuild: $msbuild"
& $msbuild $Solution /m /p:Configuration=Debug /p:Platform=x64

Write-Host "Driver build finished. Inspect SysVAD package output under: $SysvadDir"
Write-Host "Copy the built package into driver/out/memeblip-virtual-mic before install if needed."

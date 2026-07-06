$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\..\.."
$SysvadDir = Join-Path $Root "driver\vendor\Windows-driver-samples\audio\sysvad"
$Solution = Join-Path $SysvadDir "sysvad.sln"
$OutDir = Join-Path $Root "driver\out"

if (!(Test-Path $Solution)) {
  throw "SysVAD solution not found. Run driver/scripts/bootstrap-sysvad.ps1 first."
}

$msbuildCandidates = @(
  "${env:ProgramFiles}\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe",
  "${env:ProgramFiles}\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe",
  "${env:ProgramFiles}\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe",
  "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe"
)

$msbuild = $msbuildCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (!$msbuild) {
  throw "MSBuild for Visual Studio 2022 was not found. Install Visual Studio 2022 C++ tools and WDK."
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

& $msbuild $Solution /m /p:Configuration=Debug /p:Platform=x64

Write-Host "Driver build finished. Inspect SysVAD package output under: $SysvadDir"
Write-Host "Copy the built package into driver/out/memeblip-virtual-mic before install if needed."

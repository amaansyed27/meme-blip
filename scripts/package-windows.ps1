$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\.."
$ReleaseDir = Join-Path $Root "release"
$BundleDir = Join-Path $ReleaseDir "MemeBlip-Windows"
$NativeExe = Join-Path $Root "native\target\release\meme-blip-native.exe"
$DashboardDist = Join-Path $Root "dist"

Set-Location $Root

npm install
npm run build
cargo build --release --manifest-path native/Cargo.toml

if (Test-Path $BundleDir) { Remove-Item $BundleDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $BundleDir | Out-Null

Copy-Item $NativeExe (Join-Path $BundleDir "MemeBlip.exe") -Force
Copy-Item $DashboardDist (Join-Path $BundleDir "dist") -Recurse -Force

@"
@echo off
cd /d %~dp0
start "MemeBlip" MemeBlip.exe
"@ | Set-Content -Path (Join-Path $BundleDir "Launch MemeBlip.bat") -Encoding ASCII

$ZipPath = Join-Path $ReleaseDir "MemeBlip-Windows.zip"
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
Compress-Archive -Path (Join-Path $BundleDir "*") -DestinationPath $ZipPath -Force

Write-Host "Packaged MemeBlip to $ZipPath"

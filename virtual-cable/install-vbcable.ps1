$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\.."
$ThirdPartyDir = Join-Path $Root "third_party\vb-cable"
$ZipPath = Join-Path $ThirdPartyDir "VBCABLE_Driver_Pack45.zip"
$ExtractDir = Join-Path $ThirdPartyDir "VBCABLE_Driver_Pack45"
$DownloadUrl = "https://download.vb-audio.com/Download_CABLE/VBCABLE_Driver_Pack45.zip"

function Test-Admin {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (!(Test-Admin)) {
  Write-Host "VB-CABLE driver installation needs administrator rights. Relaunching elevated..." -ForegroundColor Yellow
  Start-Process powershell -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`""
  exit 0
}

New-Item -ItemType Directory -Force -Path $ThirdPartyDir | Out-Null

if (!(Test-Path $ZipPath)) {
  Write-Host "Downloading VB-CABLE from VB-Audio..."
  Write-Host "Source: $DownloadUrl"
  try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath
  } catch {
    Write-Host "Automatic download failed." -ForegroundColor Red
    Write-Host "Manually download VBCABLE_Driver_Pack45.zip from https://vb-audio.com/Cable/"
    Write-Host "Place it here: $ZipPath"
    throw
  }
}

if (Test-Path $ExtractDir) {
  Remove-Item -Recurse -Force $ExtractDir
}
New-Item -ItemType Directory -Force -Path $ExtractDir | Out-Null
Expand-Archive -Force $ZipPath $ExtractDir

$setup = Get-ChildItem $ExtractDir -Recurse -Filter "VBCABLE_Setup_x64.exe" | Select-Object -First 1
if (!$setup) {
  $setup = Get-ChildItem $ExtractDir -Recurse -Filter "VBCABLE_Setup.exe" | Select-Object -First 1
}

if (!$setup) {
  throw "VB-CABLE setup executable was not found inside $ZipPath"
}

Write-Host "Launching VB-CABLE setup: $($setup.FullName)"
Write-Host "In the VB-CABLE installer, click Install Driver. Reboot after installation." -ForegroundColor Yellow
Start-Process -FilePath $setup.FullName -Wait

Write-Host "VB-CABLE installer closed. Reboot Windows, then run: npm run cable:check" -ForegroundColor Green

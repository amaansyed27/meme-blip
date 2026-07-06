$ErrorActionPreference = "Stop"

$KitsRoot = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10"
$IncludeRoot = Join-Path $KitsRoot "Include"
$BinRoot = Join-Path $KitsRoot "bin"

Write-Host "WDK diagnostic" -ForegroundColor Cyan
Write-Host "Kits root: $KitsRoot"

$wdm = Get-ChildItem $IncludeRoot -Filter "wdm.h" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
$portcls = Get-ChildItem $IncludeRoot -Filter "portcls.h" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
$infverifExe = Get-ChildItem $BinRoot -Filter "infverif.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
$infverifDll = Get-ChildItem $BinRoot -Filter "InfVerif.dll" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 5

Write-Host "wdm.h:      $($wdm.FullName)"
Write-Host "portcls.h:  $($portcls.FullName)"
Write-Host "infverif.exe: $($infverifExe.FullName)"
Write-Host "InfVerif.dll candidates:"
$infverifDll | ForEach-Object { Write-Host "  $($_.FullName)" }

if (!$wdm -or !$portcls) {
  throw "Kernel headers are missing. Reinstall/repair WDK."
}

if (!$infverifExe -or !$infverifDll) {
  Write-Host "InfVerif tooling looks incomplete. Run Visual Studio Installer repair or reinstall the matching WDK." -ForegroundColor Yellow
} else {
  Write-Host "WDK files look present. If MSBuild still cannot load InfVerif.dll, repair/reinstall WDK or run from a fresh Developer PowerShell." -ForegroundColor Green
}

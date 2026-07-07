$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\.."
$ReleaseDir = Join-Path $Root "release"
$BundleDir = Join-Path $ReleaseDir "MemeBlip-Windows"
$InstallerDir = Join-Path $ReleaseDir "installer"
$NativeExe = Join-Path $Root "native\target\release\meme-blip-native.exe"
$DashboardDist = Join-Path $Root "dist"
$BrandPng = Join-Path $Root "assets\brand\memeblip-icon-1024.png"
$IconPath = Join-Path $ReleaseDir "memeblip-windows.ico"
$MsiPath = Join-Path $ReleaseDir "MemeBlip-Setup.msi"
$Version = "0.1.0"

function Get-ToolPath($name) {
  $command = Get-Command $name -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  $wixBin = Join-Path ${env:ProgramFiles(x86)} "WiX Toolset v3.11\bin\$name"
  if (Test-Path $wixBin) { return $wixBin }

  return $null
}

function New-IcoFromPng($SourcePng, $DestinationIco) {
  Add-Type -AssemblyName System.Drawing
  $sizes = @(16, 32, 48, 256)
  $pngEntries = @()

  foreach ($size in $sizes) {
    $source = [System.Drawing.Image]::FromFile($SourcePng)
    $graphics = $null
    $bitmap = $null
    try {
      $bitmap = New-Object System.Drawing.Bitmap $size, $size
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.DrawImage($source, 0, 0, $size, $size)
      $stream = New-Object System.IO.MemoryStream
      $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
      $pngEntries += ,@($size, $stream.ToArray())
    } finally {
      if ($graphics) { $graphics.Dispose() }
      if ($bitmap) { $bitmap.Dispose() }
      $source.Dispose()
    }
  }

  $writer = New-Object System.IO.BinaryWriter([System.IO.File]::Open($DestinationIco, [System.IO.FileMode]::Create))
  try {
    $writer.Write([UInt16]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]$pngEntries.Count)
    $offset = 6 + (16 * $pngEntries.Count)

    foreach ($entry in $pngEntries) {
      $size = [int]$entry[0]
      $bytes = [byte[]]$entry[1]
      $dimensionByte = [byte]$size
      if ($size -eq 256) { $dimensionByte = [byte]0 }
      $writer.Write($dimensionByte)
      $writer.Write($dimensionByte)
      $writer.Write([byte]0)
      $writer.Write([byte]0)
      $writer.Write([UInt16]1)
      $writer.Write([UInt16]32)
      $writer.Write([UInt32]$bytes.Length)
      $writer.Write([UInt32]$offset)
      $offset += $bytes.Length
    }

    foreach ($entry in $pngEntries) {
      $writer.Write([byte[]]$entry[1])
    }
  } finally {
    $writer.Dispose()
  }
}

Set-Location $Root

npm install
npm run build
cargo build --release --manifest-path native/Cargo.toml

if (Test-Path $BundleDir) { Remove-Item $BundleDir -Recurse -Force }
if (Test-Path $InstallerDir) { Remove-Item $InstallerDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $BundleDir | Out-Null
New-Item -ItemType Directory -Force -Path $InstallerDir | Out-Null
New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null

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
Write-Host "Packaged portable bundle to $ZipPath"

if (Test-Path $BrandPng) {
  New-IcoFromPng -SourcePng $BrandPng -DestinationIco $IconPath
  Copy-Item $IconPath (Join-Path $BundleDir "MemeBlip.ico") -Force
} else {
  Write-Warning "Brand PNG not found at $BrandPng. MSI will be built without a product icon."
}

$heat = Get-ToolPath "heat.exe"
$candle = Get-ToolPath "candle.exe"
$light = Get-ToolPath "light.exe"

if (!$heat -or !$candle -or !$light) {
  Write-Warning "WiX Toolset was not found. Portable zip is ready, but MSI was skipped. Install WiX Toolset v3.11 to build MemeBlip-Setup.msi."
  exit 0
}

$HarvestWxs = Join-Path $InstallerDir "MemeBlipFiles.wxs"
$ProductWxs = Join-Path $InstallerDir "Product.wxs"
$ProductWixObj = Join-Path $InstallerDir "Product.wixobj"
$HarvestWixObj = Join-Path $InstallerDir "MemeBlipFiles.wixobj"

& $heat dir $BundleDir -cg MemeBlipFiles -dr INSTALLFOLDER -srd -sreg -gg -var var.BundleDir -out $HarvestWxs

$iconXml = ""
$shortcutIconAttribute = ""
if (Test-Path $IconPath) {
  $iconXml = '<Icon Id="MemeBlipIcon.ico" SourceFile="' + $IconPath + '" />' + "`n" + '    <Property Id="ARPPRODUCTICON" Value="MemeBlipIcon.ico" />'
  $shortcutIconAttribute = ' Icon="MemeBlipIcon.ico"'
}

@"
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" Name="MemeBlip" Language="1033" Version="$Version" Manufacturer="Amaan Syed" UpgradeCode="B4E22F46-54D8-4629-8B17-94E5D802DC9D">
    <Package InstallerVersion="500" Compressed="yes" InstallScope="perMachine" />
    <MajorUpgrade DowngradeErrorMessage="A newer version of MemeBlip is already installed." />
    <MediaTemplate EmbedCab="yes" />
    $iconXml

    <Feature Id="DefaultFeature" Title="MemeBlip" Level="1">
      <ComponentGroupRef Id="MemeBlipFiles" />
      <ComponentRef Id="ApplicationShortcut" />
    </Feature>

    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFilesFolder">
        <Directory Id="INSTALLFOLDER" Name="MemeBlip" />
      </Directory>
      <Directory Id="ProgramMenuFolder">
        <Directory Id="ApplicationProgramsFolder" Name="MemeBlip" />
      </Directory>
    </Directory>

    <DirectoryRef Id="ApplicationProgramsFolder">
      <Component Id="ApplicationShortcut" Guid="*">
        <Shortcut Id="ApplicationStartMenuShortcut" Name="MemeBlip" Description="MemeBlip tray soundboard" Target="[INSTALLFOLDER]MemeBlip.exe" WorkingDirectory="INSTALLFOLDER"$shortcutIconAttribute />
        <RemoveFolder Id="ApplicationProgramsFolder" On="uninstall" />
        <RegistryValue Root="HKCU" Key="Software\MemeBlip" Name="installed" Type="integer" Value="1" KeyPath="yes" />
      </Component>
    </DirectoryRef>
  </Product>
</Wix>
"@ | Set-Content -Path $ProductWxs -Encoding UTF8

& $candle -dBundleDir=$BundleDir -out $HarvestWixObj $HarvestWxs
& $candle -dBundleDir=$BundleDir -out $ProductWixObj $ProductWxs
& $light -out $MsiPath $ProductWixObj $HarvestWixObj

Write-Host "Packaged MSI installer to $MsiPath"

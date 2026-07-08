$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\.."
$ReleaseDir = Join-Path $Root "release"
$BundleDir = Join-Path $ReleaseDir "MemeBlip-Windows"
$InstallerDir = Join-Path $ReleaseDir "installer"
$NativeExe = Join-Path $Root "native\target\release\meme-blip-native.exe"
$DashboardDist = Join-Path $Root "dist"
$BrandPng = Join-Path $Root "assets\brand\memeblip-icon-1024.png"
$IconPath = Join-Path $ReleaseDir "memeblip-windows.ico"
$BannerBmpPath = Join-Path $InstallerDir "memeblip-banner.bmp"
$DialogBmpPath = Join-Path $InstallerDir "memeblip-dialog.bmp"
$MsiPath = Join-Path $ReleaseDir "MemeBlip-Setup.msi"
$Version = "1.1.1"
$VbCableUrl = "https://vb-audio.com/Cable/"

function Invoke-Checked($FilePath, [string[]]$Arguments) {
  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code ${LASTEXITCODE}: $FilePath $($Arguments -join ' ')"
  }
}

function Stop-MemeBlipProcesses {
  $ports = @(48322, 48321)
  foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
      $processId = $connection.OwningProcess
      if (!$processId -or $processId -eq 0) { continue }
      try {
        $process = Get-Process -Id $processId -ErrorAction Stop
        Write-Host "Stopping MemeBlip process on port ${port}: $($process.ProcessName) [$processId]"
        Stop-Process -Id $processId -Force
      } catch {
        Write-Host "Could not stop process $processId on port ${port}: $($_.Exception.Message)" -ForegroundColor Yellow
      }
    }
  }

  @("MemeBlip", "meme-blip-native") | ForEach-Object {
    Get-Process -Name $_ -ErrorAction SilentlyContinue | ForEach-Object {
      Write-Host "Stopping running MemeBlip process: $($_.ProcessName) [$($_.Id)]"
      Stop-Process -Id $_.Id -Force
    }
  }
}

function Stop-MsiProcessesUsingPath($Path) {
  $normalized = [System.IO.Path]::GetFullPath([string]$Path)
  $leaf = [System.IO.Path]::GetFileName($normalized)
  $escaped = $normalized.Replace('\', '\\')

  Get-CimInstance Win32_Process -Filter "name = 'msiexec.exe'" -ErrorAction SilentlyContinue | ForEach-Object {
    $commandLine = [string]$_.CommandLine
    if (!$commandLine) { return }
    if ($commandLine -like "*$normalized*" -or $commandLine -like "*$escaped*" -or $commandLine -like "*$leaf*") {
      Write-Host "Stopping MSI process using ${leaf}: [$($_.ProcessId)]"
      Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
  }
}

function Clear-ExistingMsi($Path) {
  if (!(Test-Path $Path)) { return }

  Stop-MsiProcessesUsingPath $Path
  Start-Sleep -Milliseconds 350

  for ($attempt = 1; $attempt -le 6; $attempt++) {
    try {
      Remove-Item $Path -Force -ErrorAction Stop
      Write-Host "Removed previous MSI: $Path"
      return
    } catch {
      if ($attempt -eq 6) {
        throw "Could not replace $Path because it is still locked. Close every 'MemeBlip Setup' installer window and stop any msiexec.exe using it, then run npm run package:windows again. Original error: $($_.Exception.Message)"
      }
      Write-Host "Previous MSI is locked; retrying remove attempt $attempt/6..." -ForegroundColor Yellow
      Stop-MsiProcessesUsingPath $Path
      Start-Sleep -Milliseconds 700
    }
  }
}

function Escape-Xml($value) {
  return [System.Security.SecurityElement]::Escape([string]$value)
}

function Get-ToolPath($name) {
  $command = Get-Command $name -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  $roots = @()
  if (${env:ProgramFiles(x86)}) { $roots += ${env:ProgramFiles(x86)} }
  if ($env:ProgramFiles) { $roots += $env:ProgramFiles }

  foreach ($root in $roots) {
    $toolsets = Get-ChildItem -Path $root -Directory -Filter "WiX Toolset v*" -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    foreach ($toolset in $toolsets) {
      $candidate = Join-Path $toolset.FullName "bin\$name"
      if (Test-Path $candidate) { return $candidate }
    }
  }

  $commonCandidates = @(
    "C:\Program Files (x86)\WiX Toolset v3.14\bin\$name",
    "C:\Program Files (x86)\WiX Toolset v3.11\bin\$name",
    "C:\Program Files\WiX Toolset v3.14\bin\$name",
    "C:\Program Files\WiX Toolset v3.11\bin\$name"
  )

  foreach ($candidate in $commonCandidates) {
    if (Test-Path $candidate) { return $candidate }
  }

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
    $stream = $null
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
      if ($stream) { $stream.Dispose() }
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
      if ($size -eq 256) {
        $dimensionByte = [byte]0
      } else {
        $dimensionByte = [byte]$size
      }
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

function New-WixUiBitmap($SourcePng, $DestinationBmp, [int]$Width, [int]$Height, [string]$Variant) {
  Add-Type -AssemblyName System.Drawing
  $source = [System.Drawing.Image]::FromFile($SourcePng)
  $bitmap = $null
  $graphics = $null
  $titleFont = $null
  $bodyFont = $null
  $titleBrush = $null
  $bodyBrush = $null

  try {
    $bitmap = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    if ($Variant -eq "banner") {
      $graphics.Clear([System.Drawing.Color]::FromArgb(244, 237, 223))
      $logoSize = 34
      $graphics.DrawImage($source, $Width - $logoSize - 18, 12, $logoSize, $logoSize)
    } else {
      $graphics.Clear([System.Drawing.Color]::FromArgb(7, 7, 6))
      $logoSize = 110
      $graphics.DrawImage($source, 42, 42, $logoSize, $logoSize)
      $titleFont = New-Object System.Drawing.Font "Segoe UI", 28, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
      $bodyFont = New-Object System.Drawing.Font "Segoe UI", 14, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
      $titleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(244, 237, 223))
      $bodyBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(215, 204, 182))
      $graphics.DrawString("MemeBlip", $titleFont, $titleBrush, 42, 170)
      $graphics.DrawString("Tray soundboard for calls, games, and meetings.", $bodyFont, $bodyBrush, 42, 208)
    }

    $bitmap.Save($DestinationBmp, [System.Drawing.Imaging.ImageFormat]::Bmp)
  } finally {
    if ($bodyBrush) { $bodyBrush.Dispose() }
    if ($titleBrush) { $titleBrush.Dispose() }
    if ($bodyFont) { $bodyFont.Dispose() }
    if ($titleFont) { $titleFont.Dispose() }
    if ($graphics) { $graphics.Dispose() }
    if ($bitmap) { $bitmap.Dispose() }
    $source.Dispose()
  }
}

function New-FileComponentXml($file, $indent) {
  $script:ComponentCounter++
  $componentId = "CMP{0:D5}" -f $script:ComponentCounter
  if ($file.Name -eq "MemeBlip.exe") {
    $fileId = "MemeBlipExecutable"
  } else {
    $fileId = "FIL{0:D5}" -f $script:ComponentCounter
  }
  [void]$script:ComponentRefs.Add(('      <ComponentRef Id="{0}" />' -f $componentId))
  $source = Escape-Xml $file.FullName
  return @"
$indent<Component Id="$componentId" Guid="*">
$indent  <File Id="$fileId" Source="$source" KeyPath="yes" />
$indent</Component>
"@
}

function New-DirectoryContentXml($directoryPath, $indent) {
  $chunks = New-Object System.Collections.Generic.List[string]

  Get-ChildItem -Path $directoryPath -File | Sort-Object Name | ForEach-Object {
    [void]$chunks.Add((New-FileComponentXml $_ $indent).TrimEnd())
  }

  Get-ChildItem -Path $directoryPath -Directory | Sort-Object Name | ForEach-Object {
    $script:DirectoryCounter++
    $directoryId = "DIR{0:D5}" -f $script:DirectoryCounter
    $name = Escape-Xml $_.Name
    $child = New-DirectoryContentXml $_.FullName ($indent + "  ")
    [void]$chunks.Add(@"
$indent<Directory Id="$directoryId" Name="$name">
$child
$indent</Directory>
"@.TrimEnd())
  }

  return ($chunks -join "`n")
}

function New-LicenseRtf($OutputPath) {
  @"
{\rtf1\ansi\deff0
{\fonttbl{\f0 Segoe UI;}}
\f0\fs20
MemeBlip v$Version\par
\par
MemeBlip is provided under the MIT License.\par
\par
For virtual microphone routing, MemeBlip works with VB-CABLE. VB-CABLE is a separate virtual audio driver and is not installed silently by this setup. Finish installation, launch MemeBlip, and use the first-run audio setup screen to install/check VB-CABLE.\par
}
"@ | Set-Content -Path $OutputPath -Encoding ASCII
}

function New-ProductWxs($OutputPath, $LicenseRtfPath, $BannerBmp, $DialogBmp) {
  $script:ComponentCounter = 0
  $script:DirectoryCounter = 0
  $script:ComponentRefs = New-Object System.Collections.Generic.List[string]

  $installTree = New-DirectoryContentXml $BundleDir "          "
  $componentRefsText = $script:ComponentRefs -join "`n"

  $iconXml = ""
  $shortcutIconAttribute = ""
  if (Test-Path $IconPath) {
    $escapedIconPath = Escape-Xml $IconPath
    $iconXml = '<Icon Id="MemeBlipIcon.ico" SourceFile="' + $escapedIconPath + '" />' + "`n" + '    <Property Id="ARPPRODUCTICON" Value="MemeBlipIcon.ico" />'
    $shortcutIconAttribute = ' Icon="MemeBlipIcon.ico"'
  }

  $escapedLicenseRtfPath = Escape-Xml $LicenseRtfPath
  $escapedBannerBmp = Escape-Xml $BannerBmp
  $escapedDialogBmp = Escape-Xml $DialogBmp

@"
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" Name="MemeBlip" Language="1033" Version="$Version" Manufacturer="Dawnlight Labs" UpgradeCode="B4E22F46-54D8-4629-8B17-94E5D802DC9D">
    <Package InstallerVersion="500" Compressed="yes" InstallScope="perMachine" />
    <MajorUpgrade DowngradeErrorMessage="A newer version of MemeBlip is already installed." />
    <MediaTemplate EmbedCab="yes" />
    $iconXml

    <Property Id="WIXUI_INSTALLDIR" Value="INSTALLFOLDER" />
    <Property Id="WIXUI_EXITDIALOGOPTIONALCHECKBOX" Value="1" />
    <Property Id="WIXUI_EXITDIALOGOPTIONALCHECKBOXTEXT" Value="Launch MemeBlip and check VB-CABLE setup" />
    <Property Id="WixShellExecTarget" Value="[#MemeBlipExecutable]" />
    <CustomAction Id="LaunchMemeBlipAfterInstall" BinaryKey="WixCA" DllEntry="WixShellExec" Impersonate="yes" />
    <WixVariable Id="WixUILicenseRtf" Value="$escapedLicenseRtfPath" />
    <WixVariable Id="WixUIBannerBmp" Value="$escapedBannerBmp" />
    <WixVariable Id="WixUIDialogBmp" Value="$escapedDialogBmp" />
    <UIRef Id="WixUI_InstallDir" />
    <UIRef Id="WixUI_ErrorProgressText" />
    <UI>
      <Publish Dialog="ExitDialog" Control="Finish" Event="DoAction" Value="LaunchMemeBlipAfterInstall">WIXUI_EXITDIALOGOPTIONALCHECKBOX = 1 and NOT Installed</Publish>
    </UI>

    <Feature Id="DefaultFeature" Title="MemeBlip" Level="1">
      <ComponentGroupRef Id="MemeBlipFiles" />
      <ComponentRef Id="ApplicationShortcut" />
    </Feature>

    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFilesFolder">
        <Directory Id="INSTALLFOLDER" Name="MemeBlip">
$installTree
        </Directory>
      </Directory>
      <Directory Id="ProgramMenuFolder">
        <Directory Id="ApplicationProgramsFolder" Name="MemeBlip" />
      </Directory>
    </Directory>

    <DirectoryRef Id="ApplicationProgramsFolder">
      <Component Id="ApplicationShortcut" Guid="*">
        <Shortcut Id="ApplicationStartMenuShortcut" Name="MemeBlip" Description="MemeBlip tray soundboard" Target="[INSTALLFOLDER]MemeBlip.exe" WorkingDirectory="INSTALLFOLDER"$shortcutIconAttribute />
        <Shortcut Id="VbCableSetupShortcut" Name="VB-CABLE Setup" Description="Open the VB-CABLE virtual audio driver setup page" Target="[INSTALLFOLDER]VB-CABLE Setup.url" WorkingDirectory="INSTALLFOLDER"$shortcutIconAttribute />
        <RemoveFolder Id="ApplicationProgramsFolder" On="uninstall" />
        <RegistryValue Root="HKCU" Key="Software\MemeBlip" Name="installed" Type="integer" Value="1" KeyPath="yes" />
      </Component>
    </DirectoryRef>

    <ComponentGroup Id="MemeBlipFiles">
$componentRefsText
    </ComponentGroup>
  </Product>
</Wix>
"@ | Set-Content -Path $OutputPath -Encoding UTF8
}

Set-Location $Root

Stop-MemeBlipProcesses

npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
cargo build --release --manifest-path native/Cargo.toml
if ($LASTEXITCODE -ne 0) { throw "cargo release build failed" }

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
"@ | Set-Content -Path (Join-Path $BundleDir "Start MemeBlip.bat") -Encoding ASCII

@"
[InternetShortcut]
URL=$VbCableUrl
"@ | Set-Content -Path (Join-Path $BundleDir "VB-CABLE Setup.url") -Encoding ASCII

if (!(Test-Path $BrandPng)) { throw "Missing brand PNG at $BrandPng" }
New-IcoFromPng $BrandPng $IconPath
New-WixUiBitmap $BrandPng $BannerBmpPath 493 58 "banner"
New-WixUiBitmap $BrandPng $DialogBmpPath 493 312 "dialog"
$LicenseRtfPath = Join-Path $InstallerDir "license.rtf"
New-LicenseRtf $LicenseRtfPath
$WxsPath = Join-Path $InstallerDir "Product.wxs"
New-ProductWxs $WxsPath $LicenseRtfPath $BannerBmpPath $DialogBmpPath

$candle = Get-ToolPath "candle.exe"
$light = Get-ToolPath "light.exe"
if (!$candle -or !$light) {
  Write-Host "WiX Toolset was not found. ZIP bundle is ready at $BundleDir" -ForegroundColor Yellow
  Write-Host "Install WiX Toolset v3 to build the MSI." -ForegroundColor Yellow
  exit 0
}

Clear-ExistingMsi $MsiPath
$WixObj = Join-Path $InstallerDir "Product.wixobj"
Invoke-Checked $candle @("-out", $WixObj, $WxsPath)
Invoke-Checked $light @("-ext", "WixUIExtension", "-ext", "WixUtilExtension", "-out", $MsiPath, $WixObj)
Write-Host "Packaged MemeBlip Windows bundle: $BundleDir" -ForegroundColor Green
Write-Host "Built MSI installer: $MsiPath" -ForegroundColor Green

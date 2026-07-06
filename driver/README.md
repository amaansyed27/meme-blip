# MemeBlip Virtual Mic

MemeBlip now treats a built-in virtual microphone as the product path. The companion and dashboard no longer assume VB-CABLE or VoiceMeeter as the final route.

## What this workspace does

This folder contains the WDK driver workspace and scripts required to bootstrap, build, install, and remove the MemeBlip virtual microphone driver.

The implementation target is a SysVAD-derived Windows virtual audio device. Microsoft's SysVAD sample is the correct base because it is a WDM virtual audio driver sample that exposes audio endpoints without physical hardware.

## Required local tools

Install these before building the driver:

- Visual Studio 2022 with C++ desktop workload
- Windows SDK
- Windows Driver Kit
- Git
- PowerShell running as Administrator for install/uninstall

## Build

```powershell
powershell -ExecutionPolicy Bypass -File driver/scripts/bootstrap-sysvad.ps1
powershell -ExecutionPolicy Bypass -File driver/scripts/build-driver.ps1
```

## Install on a test machine

```powershell
powershell -ExecutionPolicy Bypass -File driver/scripts/install-driver.ps1
```

## Uninstall

```powershell
powershell -ExecutionPolicy Bypass -File driver/scripts/uninstall-driver.ps1
```

## Driver signing reality

Windows will not load an unsigned kernel driver in normal production mode. During development, test signing is required. For public distribution, the driver package needs proper signing.

## Intended audio flow

```text
MemeBlip Companion
  -> MemeBlip Virtual Mic Driver
  -> Windows sees input device: MemeBlip Virtual Mic
  -> Discord / Meet / Valorant selects MemeBlip Virtual Mic
```

A later implementation detail inside the driver should mix the real microphone capture stream and MemeBlip's injected PCM stream so target apps receive both voice and soundboard clips from a single capture endpoint.

# Release Guide

This is the release checklist for MemeBlip.

## Before release

Run local checks:

```powershell
npm run build
npm run site:build
cargo check --manifest-path native/Cargo.toml
cargo build --manifest-path native/Cargo.toml
```

Manual checks:

- Dashboard opens.
- Companion starts.
- Clip import works.
- Clip playback works.
- Active soundboard scopes hotkeys.
- Mic passthrough works.
- Audio Routing shows the correct devices.
- Settings shows real companion state.
- Landing page builds and the download button resolves.

## Package Windows build

```powershell
npm run package:windows
```

Expected output:

```text
release/MemeBlip-Windows
release/MemeBlip-Windows.zip
release/MemeBlip-Setup.msi
```

The MSI uses a generated icon from:

```text
assets/brand/memeblip-icon-1024.png
```

The script generates:

```text
release/memeblip-windows.ico
```

WiX Toolset v3.11 is required for MSI generation. Without WiX, the package script still creates the portable zip.

## GitHub Release

Recommended release flow:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The `Release Windows` GitHub Actions workflow builds and uploads:

```text
MemeBlip-Setup.msi
MemeBlip-Windows.zip
```

The landing site download button points to the latest MSI release asset:

```text
https://github.com/amaansyed27/meme-blip/releases/latest/download/MemeBlip-Setup.msi
```

## Landing page

The public landing page lives in:

```text
site/
```

Build locally:

```powershell
npm run site:build
```

Deploy with Vercel CLI using:

```text
docs/VERCEL_DEPLOY.md
```

## Release checklist

1. Update version numbers.
2. Run local checks.
3. Push a `v*` tag.
4. Wait for the Windows release workflow.
5. Confirm the release has `MemeBlip-Setup.msi`.
6. Deploy the landing page to Vercel.
7. Click the site download button and confirm it downloads the latest installer.
8. Test update detection from the app.

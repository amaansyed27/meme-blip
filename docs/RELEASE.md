# Release Guide

This is the release checklist for MemeBlip.

## Before release

Run local checks:

```powershell
npm run build
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

## Package Windows build

```powershell
npm run package:windows
```

Expected output:

```text
release/MemeBlip-Windows
release/MemeBlip-Windows.zip
```

## GitHub Release

1. Update version numbers.
2. Update release notes.
3. Build/package Windows assets.
4. Create a GitHub Release.
5. Upload the Windows package.
6. Test update detection from the app.

## Website task

After final local testing, create a simple landing page and expose the Windows installer from the site.

See:

```text
docs/TODO.md
LOGO_SETUP.md
```

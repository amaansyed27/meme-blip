# MemeBlip

MemeBlip is a local-first soundboard for games, calls, and meetings.

The dashboard manages sounds, boards, hotkeys, routing, settings, and updates. The native companion runs in the background, serves the packaged dashboard, exposes the local API, plays audio through output devices, owns the tray menu, and registers hotkeys.

## Development

```bash
npm install
npm run dev
npm run companion
```

Development dashboard: `http://127.0.0.1:48321`
Packaged dashboard and API: `http://127.0.0.1:48322`

## Package for Windows

```bash
npm run package:windows
```

This creates a portable bundle under `release/MemeBlip-Windows` and `release/MemeBlip-Windows.zip`.

Tagged releases build Windows assets through the GitHub Actions release workflow.

## Updates

MemeBlip checks GitHub Releases, compares the latest release with the current native companion version, downloads the matching Windows asset, stores it under the app update folder, and opens it for the user.

## Current features

- Multi-page dashboard
- Local sound import
- Rename, board edit, volume edit, and delete from the library
- Persistent native sound library
- Output device enumeration
- Audio playback through `rodio` and `cpal`
- Local token header for the companion API
- Native tray menu
- Global hotkey worker with rescans
- Routing setup wizard
- GitHub Release update check and download
- Windows portable package and installer workflow

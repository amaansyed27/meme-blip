# MemeBlip

MemeBlip is a local-first tray soundboard for games, calls, and meetings. It lets you import short clips, organize them into soundboards, trigger them with hotkeys, and route clip audio plus optional mic passthrough into apps through VB-CABLE.

The project has two parts:

- **Web dashboard**: React/Vite UI for sounds, boards, hotkeys, routing, and settings.
- **Native companion**: Rust app that owns playback, local API, tray integration, hotkeys, audio devices, and persistent storage.

## Current scope

Reliable MVP flow:

```text
Physical mic -> MemeBlip mic passthrough -> CABLE Input
MemeBlip clips -> CABLE Input
CABLE Output -> game/call microphone
Monitor output -> headphones/speakers
```

System-wide audio routing is intentionally not part of the product path right now because plain VB-CABLE does not monitor cleanly to headphones while also sending to the call.

## Features

- Import local audio clips.
- Rename clips and assign them to boards.
- Create boards automatically from clip metadata.
- Activate one soundboard so only that board owns hotkeys.
- Assign hotkeys with presets or press-to-record controls.
- Route clips to `CABLE Input` for apps that use `CABLE Output` as microphone.
- Optional local monitor playback to your headphones/speakers.
- Optional physical mic passthrough into the same virtual route.
- Local companion API protected by a local token header.
- GitHub Release update check/download support.
- Windows packaging scripts.

## Requirements

- Windows for the current production path.
- Node.js 22 or newer.
- Rust stable.
- VB-CABLE installed for virtual microphone routing.

## Development

Install dependencies:

```bash
npm install
```

Run the native companion:

```bash
npm run companion
```

Run the dashboard in another terminal:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:48321
```

Companion API and packaged dashboard run on:

```text
http://127.0.0.1:48322
```

If the companion executable is locked or the port is busy:

```powershell
npm run companion:stop
npm run companion
```

## VB-CABLE setup

Check whether VB-CABLE is installed:

```powershell
npm run cable:check
```

Install helper:

```powershell
npm run cable:install
```

After install, reboot Windows.

Expected route:

```text
MemeBlip route/output: CABLE Input
Target app microphone: CABLE Output
Monitor output: normal headphones/speakers
```

## Build

Build the web app:

```bash
npm run build
```

Build the native companion:

```bash
npm run build:companion
```

Package Windows build:

```powershell
npm run package:windows
```

This creates a portable bundle under `release/MemeBlip-Windows` and `release/MemeBlip-Windows.zip`.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [How MemeBlip works](docs/WORKING.md)
- [Project index](docs/INDEX.md)
- [Code review notes](docs/CODE_REVIEW.md)
- [TODO](docs/TODO.md)
- [Logo and icon placement](LOGO_SETUP.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT. See [LICENSE](LICENSE).

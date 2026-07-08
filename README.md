<p align="center">
  <img src="assets/brand/memeblip-icon-1024.png" alt="MemeBlip logo" width="112" />
</p>

<h1 align="center">MemeBlip</h1>

<p align="center">
  <strong>Local-first Windows tray soundboard for Discord, games, calls, meetings, and virtual microphone routing.</strong>
</p>

<p align="center">
  <a href="https://memeblip.dawnlightlabs.com/"><strong>Install from the landing page</strong></a>
  ·
  <a href="docs/WORKING.md">How it works</a>
</p>

<p align="center">
  <a href="https://github.com/amaansyed27/meme-blip/stargazers"><strong>⭐ Star this repo if MemeBlip is useful</strong></a>
</p>

<p align="center">
  <img alt="Platform: Windows" src="https://img.shields.io/badge/platform-Windows-eadfca?labelColor=11100d" />
  <img alt="Local first" src="https://img.shields.io/badge/local--first-yes-eadfca?labelColor=11100d" />
  <img alt="Built with Rust and React" src="https://img.shields.io/badge/Rust%20%2B%20React-desktop-eadfca?labelColor=11100d" />
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-eadfca?labelColor=11100d" />
</p>

MemeBlip is a local-first tray soundboard for games, calls, and meetings. It lets you import short clips, organize them into soundboards, trigger them with hotkeys, and route clip audio plus optional mic passthrough into apps through VB-CABLE.

Install MemeBlip from the landing page only: https://memeblip.dawnlightlabs.com/

If MemeBlip helps your stream, Discord calls, meetings, or game comms, star the repo so more people can find it: https://github.com/amaansyed27/meme-blip

## Discoverability tags

`windows-soundboard` `soundboard` `tray-soundboard` `discord-soundboard` `valorant-soundboard` `google-meet-soundboard` `zoom-soundboard` `virtual-microphone` `mic-routing` `vb-cable` `audio-routing` `hotkey-soundboard` `rust` `react` `vite`

The project has three parts:

- **Web dashboard**: React/Vite UI for sounds, boards, hotkeys, routing, and settings.
- **Native companion**: Rust app that owns playback, local API, tray integration, hotkeys, audio devices, and persistent storage.
- **Landing page**: Minimal public site under `site/`, deployable on Vercel.

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
- Public single-page landing site with a download button for the Windows setup.

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

Run the landing page locally:

```bash
npm run site:dev
```

Open:

```text
http://127.0.0.1:48330
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

Build the web dashboard:

```bash
npm run build
```

Build the landing site:

```bash
npm run site:build
```

Build the native companion:

```bash
npm run build:companion
```

Package Windows build:

```powershell
npm run package:windows
```

This creates local build outputs:

```text
release/MemeBlip-Windows.zip
release/MemeBlip-Setup.msi
```

Public installs should go through:

```text
https://memeblip.dawnlightlabs.com/
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [How MemeBlip works](docs/WORKING.md)
- [Project index](docs/INDEX.md)
- [Release guide](docs/RELEASE.md)
- [Vercel deploy guide](docs/VERCEL_DEPLOY.md)
- [Changelog](docs/CHANGELOG.md)
- [Code review notes](docs/CODE_REVIEW.md)
- [TODO](docs/TODO.md)
- [Logo and icon placement](LOGO_SETUP.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Support](SUPPORT.md)

## License

MIT. See [LICENSE](LICENSE).

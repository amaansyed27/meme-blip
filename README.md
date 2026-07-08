<p align="center">
  <img src="assets/brand/memeblip-icon-1024.png" alt="MemeBlip logo" width="112" />
</p>

<h1 align="center">MemeBlip</h1>

<p align="center">
  <strong>Local-first Windows tray soundboard for Valorant, CS, Overwatch, Google Meet, Zoom, and virtual microphone routing.</strong>
</p>

<p align="center">
  <a href="https://memeblip.dawnlightlabs.com/"><strong>Install from the landing page</strong></a>
  ·
  <a href="docs/WORKING.md">How it works</a>
  ·
  <a href="docs/MYINSTANTS_SUPPLIER.md">MyInstants supplier</a>
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

MemeBlip is a local-first Windows tray soundboard for games, calls, and meetings. It lets you import clips, search for new meme sounds through a MyInstants-powered supplier page, organize clips into soundboards, trigger them with hotkeys, and route clip audio plus optional voice passthrough into apps through VB-CABLE.

Install MemeBlip from the landing page only: https://memeblip.dawnlightlabs.com/

If MemeBlip helps your games, calls, meetings, or comms, star the repo so more people can find it: https://github.com/amaansyed27/meme-blip

## Discoverability tags

`windows-soundboard` `soundboard` `tray-soundboard` `valorant-soundboard` `csgo-soundboard` `overwatch-soundboard` `google-meet-soundboard` `zoom-soundboard` `virtual-microphone` `mic-routing` `vb-cable` `audio-routing` `hotkey-soundboard` `myinstants` `rust` `react` `vite`

## Architecture

```text
MyInstants API
    -> React dashboard supplier page
    -> local companion API
    -> Rust downloader/importer
    -> local sound storage
    -> soundboards + hotkeys

Physical mic -> MemeBlip mic passthrough -> CABLE Input
MemeBlip clips -> CABLE Input
CABLE Output -> game/call microphone
Monitor preview -> headphones/speakers
```

The project has four parts:

- **Web dashboard**: React/Vite UI for sounds, boards, hotkeys, routing, settings, and the MyInstants supplier page.
- **Native companion**: Rust app that owns playback, local API, tray integration, hotkeys, audio devices, remote imports, and persistent storage.
- **Sound supplier**: MyInstants search/trending/recent/best integration for finding and importing new sounds.
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
- Search MyInstants from inside MemeBlip.
- Preview MyInstants sounds before importing.
- Import remote MyInstants MP3 sounds into local MemeBlip storage.
- Preview library sounds locally through normal headphones/speakers.
- Rename clips and assign them to boards.
- Create boards automatically from clip metadata.
- Activate one soundboard so only that board owns hotkeys.
- Assign hotkeys with presets or press-to-record controls.
- Route clips to `CABLE Input` for apps that use `CABLE Output` as microphone.
- Optional local monitor playback to your headphones/speakers.
- Optional physical mic passthrough into the same virtual route, so your voice and clips share one mic path.
- First-run VB-CABLE setup gate with check/retry actions.
- Local companion API protected by a local token header.
- GitHub Release update check/download support.
- Windows MSI packaging scripts.
- Public single-page landing site with a download button for the Windows setup.

## MyInstants supplier

The **Sounds → Get more** page uses the community MyInstants API wrapper by `abdipr/myinstants-api`.

Frontend client:

```text
app/src/services/myInstantsClient.js
```

Supported supplier calls:

```text
GET https://myinstants-api.vercel.app/search?q=<query>
GET https://myinstants-api.vercel.app/trending?q=us
GET https://myinstants-api.vercel.app/recent
GET https://myinstants-api.vercel.app/best?q=us
```

Import flow:

```text
User searches/previews sound
-> dashboard sends title + MyInstants MP3 URL to local companion
-> companion validates MyInstants media URL
-> companion downloads MP3
-> companion stores the file locally
-> clip appears in the active MemeBlip board
```

Remote imports are not streamed directly into the app during hotkey playback. They are downloaded once and then treated like normal local clips.

## Requirements

- Windows for the current production path.
- Node.js 22 or newer.
- Rust stable.
- VB-CABLE installed for virtual microphone routing.
- Internet connection only when using the MyInstants supplier or update checks.

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
- [MyInstants supplier](docs/MYINSTANTS_SUPPLIER.md)
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

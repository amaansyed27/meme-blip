# MemeBlip

MemeBlip is a local-first soundboard for games, calls, and meetings.

The product has two parts. The web dashboard manages sounds, boards, hotkeys, and routing. The native companion runs in the background, exposes a localhost API, plays audio through real output devices, owns the tray menu, and registers hotkeys.

## Run dashboard

npm install
npm run dev

Open http://127.0.0.1:48321

## Run companion

npm run companion

The companion API runs on http://127.0.0.1:48322

## Current features

- Multi-page dashboard
- Local sound import
- Persistent native sound library
- Real output device enumeration
- Real audio playback through rodio and cpal
- Localhost API for sounds, settings, devices, and playback
- Native tray menu
- Global hotkey worker for assigned shortcuts

## Main routes

- GET /health
- GET /sounds
- POST /sounds/import
- POST /sounds/:id/play
- POST /sounds/stop-all
- DELETE /sounds/:id
- GET /devices
- GET /settings
- POST /settings/output-device
- POST /sounds/:id/hotkey

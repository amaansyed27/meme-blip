# MemeBlip Architecture

MemeBlip has three runtime pieces plus the public landing page:

```text
MyInstants API
    -> React dashboard supplier page
    -> local HTTP API
    -> Rust native companion
    -> local sound storage

React dashboard  <->  local HTTP API  <->  Rust native companion
                                      ->  audio devices
                                      ->  storage
                                      ->  tray and hotkeys
                                      ->  remote sound imports
```

## Web dashboard

Location:

```text
app/src/
```

Responsibilities:

- Display imported clips.
- Display soundboards derived from real clip metadata.
- Let users activate one soundboard for hotkey scope.
- Assign and record hotkeys.
- Show audio routing state.
- Show settings and update status.
- Search, preview, and import sounds from MyInstants through the supplier page.
- Call the native companion API through `companionClient`.

The dashboard runs through Vite during development on:

```text
127.0.0.1:48321
```

## MyInstants supplier

Main files:

```text
app/src/pages/MyInstants.jsx
app/src/services/myInstantsClient.js
```

Supplier flow:

```text
User clicks Sounds -> Get more
-> dashboard calls MyInstants API wrapper
-> user previews result in the supplier page
-> user clicks Add to MemeBlip
-> dashboard sends title + mp3 URL to local companion
-> companion validates the URL
-> companion downloads the MP3
-> companion stores it in the local sounds directory
-> storage adds the clip metadata
-> clip appears in the selected board
```

The supplier uses these public endpoints from `abdipr/myinstants-api`:

```text
/search?q=<query>
/trending?q=us
/recent
/best?q=us
```

The dashboard never stores remote sounds as remote-only links. The native companion imports the MP3 into local storage so hotkey playback works offline after import.

## Native companion

Location:

```text
native/src/
```

Responsibilities:

- Start the local API on `127.0.0.1:48322`.
- Store app settings and imported clip metadata.
- Download and persist MyInstants MP3 imports.
- Play clips through the selected virtual route.
- Preview clips locally through normal output.
- Optionally mirror clip playback to monitor output.
- Optionally pass the physical microphone into the virtual route.
- Poll global hotkeys on Windows.
- Own tray behavior and clean shutdown.
- Check/download GitHub release updates.

## Local API

Main module:

```text
native/src/api.rs
```

Split route modules:

```text
native/src/api/auth.rs
native/src/api/error.rs
native/src/api/routes/devices.rs
native/src/api/routes/settings.rs
native/src/api/routes/sounds.rs
native/src/api/routes/system.rs
```

The API uses a local token from settings. Dashboard requests send it as:

```text
x-memeblip-token
```

Important routes:

```text
GET  /sounds
POST /sounds/import
POST /sounds/import-url
POST /sounds/:id/play
POST /sounds/:id/preview
POST /sounds/stop-all
GET  /devices
GET  /devices/inputs
GET  /mixer/status
POST /system/open-vbcable
```

`/sounds/:id/play` is the real route used for hotkeys and mic output. `/sounds/:id/preview` plays locally through the default speaker/headphone output for library testing.

## Audio architecture

Main file:

```text
native/src/audio.rs
```

Current reliable route:

```text
Physical mic -> MemeBlip passthrough -> CABLE Input
MemeBlip clips -> CABLE Input
CABLE Output -> target app microphone
Monitor output -> headphones/speakers
```

Preview flow:

```text
Sound card play button
-> /sounds/:id/preview
-> default Windows output
-> headphones/speakers
```

Hotkey/game/call flow:

```text
Hotkey press
-> /sounds/:id/play internally through native worker
-> selected route, usually CABLE Input
-> target app hears it through CABLE Output
```

MemeBlip does not currently own system-wide desktop audio capture. That path was removed from the product because it was unreliable with plain VB-CABLE.

## Storage

Main file:

```text
native/src/storage.rs
```

Storage owns:

- imported sound metadata
- local copies of imported audio files
- settings
- active board
- selected input/output devices
- mic passthrough state
- local API token

## Hotkeys

Main file:

```text
native/src/hotkeys.rs
```

Current behavior:

- Windows polling loop.
- Reads stored clip hotkeys.
- Reads active soundboard.
- Only registers/fires sounds from the active board unless all boards are active.

## Packaging

Main scripts:

```text
scripts/package-windows.ps1
.github/workflows/check.yml
.github/workflows/release.yml
```

Current packaging target:

```text
release/MemeBlip-Windows
release/MemeBlip-Windows.zip
release/MemeBlip-Setup.msi
```

Public installs should go through the landing page:

```text
https://memeblip.dawnlightlabs.com/
```

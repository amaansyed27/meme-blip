# MemeBlip Architecture

MemeBlip has two main runtime pieces:

```text
React dashboard  <->  local HTTP API  <->  Rust native companion
                                      ->  audio devices
                                      ->  storage
                                      ->  tray and hotkeys
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
- Call the native companion API through `companionClient`.

The dashboard runs through Vite during development on:

```text
127.0.0.1:48321
```

## Native companion

Location:

```text
native/src/
```

Responsibilities:

- Start the local API on `127.0.0.1:48322`.
- Store app settings and imported clip metadata.
- Play clips through the selected virtual route.
- Optionally mirror clip playback to monitor output.
- Optionally pass the physical microphone into the virtual route.
- Poll global hotkeys on Windows.
- Own tray behavior.
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

MemeBlip does not currently own system-wide desktop audio capture. That path was removed from the product because it was unreliable with plain VB-CABLE.

## Storage

Main file:

```text
native/src/storage.rs
```

Storage owns:

- imported sound metadata
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
```

Current packaging target:

```text
release/MemeBlip-Windows
release/MemeBlip-Windows.zip
```

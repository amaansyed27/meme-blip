# MemeBlip Mixer Workflow

MemeBlip now uses a no-WDK MVP path with VB-CABLE. The native MemeBlip driver remains parked for later.

Target behavior:

```text
System speaker output: unchanged
Physical microphone: unchanged as the source device
Target app microphone: CABLE Output
```

Internal flow:

```text
Physical mic input
  -> MemeBlip mic passthrough
  -> CABLE Input

MemeBlip soundboard clips
  -> CABLE Input

Optional app/system audio
  -> CABLE Input

CABLE Output
  -> Discord / Meet / Zoom / Valorant microphone
```

Optional local preview:

```text
MemeBlip soundboard clips
  -> Monitor output
  -> User headphones/speakers
```

## UX rules

- Do not ask the user to change system speaker output for normal mic/soundboard mode.
- Do not ask the user to disable their physical mic.
- In the target app, the user should select `CABLE Output` as the microphone.
- In MemeBlip, the virtual route should be `CABLE Input`.
- In MemeBlip, `Real mic source` should be the user's normal physical microphone.
- `CABLE Output` should not be selected as the real mic source.
- Monitor output is optional and only exists so the user can hear meme clips locally.
- For system audio mode, prefer per-app Windows Volume Mixer routing over all-system routing.
- Do not route the call app's speaker audio into `CABLE Input`, or other participants may hear echo/feedback.

## System audio mode

Recommended app-specific route:

```text
Browser / game / music app output = CABLE Input
Meet / Discord / Valorant speaker = normal headphones/speakers
Meet / Discord / Valorant microphone = CABLE Output
```

Helper:

```powershell
npm run system-audio:apps
```

All-system route:

```text
Windows system output = CABLE Input
Target app microphone = CABLE Output
```

Helper:

```powershell
npm run system-audio:all
```

Warning: all-system mode can feed call audio back into the mic if the call's speaker output also uses the system default. Prefer app-specific routing for browser/game/music sharing.

## Current implementation state

Implemented now:

- Companion settings for real mic source, VB-CABLE route, monitor output, and mic passthrough.
- Input-device enumeration through CPAL.
- Output-device enumeration through CPAL.
- Runtime mic passthrough stream from selected physical mic to selected route output.
- Soundboard clip playback to the selected route output.
- Optional monitor playback to the selected speaker/headphone output.
- `/devices/inputs` API endpoint.
- `/mixer/status` API endpoint.
- Dashboard routing UI for `Real mic source`, `Virtual route`, `Monitor output`, and `System audio mode`.
- VB-CABLE install/check helper scripts.
- Windows helper scripts for per-app and all-system audio routing pages.

## VB-CABLE install commands

```powershell
npm run cable:install
# reboot Windows after installer finishes
npm run cable:check
```

Expected devices after install:

```text
Playback/output route: CABLE Input
Recording/input for apps: CABLE Output
```

## Native driver later

Pending native-driver work:

- Replace VB-CABLE with MemeBlip's own capture endpoint.
- Feed selected real mic PCM into the native virtual mic stream.
- Feed soundboard clip PCM into the same stream.
- Mix voice + clip audio with clipping protection.
- Keep monitor playback separate from the virtual mic stream.

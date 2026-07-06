# MemeBlip Mixer Workflow

MemeBlip uses a no-WDK MVP path with VB-CABLE. The native MemeBlip driver remains parked for later.

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

CABLE Output
  -> Discord / Meet / Zoom / Valorant microphone
```

Local preview:

```text
MemeBlip soundboard clips
  -> Monitor output
  -> User headphones/speakers
```

## UX rules

- Do not ask the user to change system speaker output for normal mic/soundboard mode.
- Do not ask the user to disable their physical mic.
- In the target app, the user should select `CABLE Output` as the microphone.
- In MemeBlip, the virtual route should be normal `CABLE Input`.
- In MemeBlip, `Real mic source` should be the user's normal physical microphone.
- `CABLE Output` should not be selected as the real mic source.
- Avoid the 16ch cable route in the MVP.
- Monitor output should usually be the user's headphones/speakers so they can hear uploaded clips locally.
- System audio routing is removed from the product path because it is unreliable with plain VB-CABLE and does not monitor cleanly.

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
- Dashboard routing UI for `Real mic source`, `Virtual route`, and `Monitor output`.
- VB-CABLE install/check helper scripts.

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

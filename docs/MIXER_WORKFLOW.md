# MemeBlip Mixer Workflow

Target behavior:

```text
System speaker output: unchanged
Physical microphone: unchanged as the source device
Target app microphone: MemeBlip Virtual Mic
```

Internal flow:

```text
Physical mic input
  +
MemeBlip soundboard clips
  -> MemeBlip mixer
  -> MemeBlip Virtual Mic capture endpoint
  -> Discord / Meet / Zoom / Valorant
```

Optional local preview:

```text
MemeBlip soundboard clips
  -> Monitor output
  -> User headphones/speakers
```

## UX rules

- Do not ask the user to change system speaker output.
- Do not ask the user to disable their physical mic.
- The target app should select `MemeBlip Virtual Mic` as its microphone.
- MemeBlip should keep a selected `Real mic source` and pass it through to the virtual mic when passthrough is enabled.
- Meme sounds should be mixed into the same virtual mic stream.
- Monitor output is optional and only exists so the user can hear meme clips locally.

## Current implementation state

Implemented now:

- Companion settings for real mic source, MemeBlip route, monitor output, and mic passthrough.
- Input-device enumeration through CPAL.
- Output-device enumeration through CPAL.
- `/devices/inputs` API endpoint.
- `/mixer/status` API endpoint.
- Dashboard routing UI for `Real mic source`, `MemeBlip Virtual Mic`, and `Monitor output`.

Pending driver work after WDK build succeeds:

- Expose the final MemeBlip capture endpoint from the driver.
- Feed selected real mic PCM into the virtual mic stream.
- Feed soundboard clip PCM into the same stream.
- Mix voice + clip audio with clipping protection.
- Keep monitor playback separate from the virtual mic stream.

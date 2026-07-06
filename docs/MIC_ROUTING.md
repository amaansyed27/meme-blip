# MemeBlip Microphone Routing

MemeBlip cannot directly inject audio into a physical microphone. Windows apps receive microphone input from recording devices, not from normal speaker playback.

To send MemeBlip sounds into Discord, Google Meet, Zoom, Valorant, or another app, use a virtual audio route.

## Windows recommended setup

Install one of these:

- VB-CABLE
- VoiceMeeter

## VB-CABLE setup

1. Install VB-CABLE.
2. Restart Windows if the installer asks.
3. Open MemeBlip.
4. Go to `Audio Routing`.
5. Set `Mic route output` to `CABLE Input`.
6. Set `Monitor output` to your headphones if you also want to hear the sound locally.
7. In Discord, Google Meet, Zoom, or Valorant, set microphone/input device to `CABLE Output`.
8. Play a MemeBlip sound.

Expected flow:

```text
MemeBlip sound
  -> CABLE Input
  -> CABLE Output
  -> App microphone
```

Optional monitor flow:

```text
MemeBlip sound
  -> CABLE Input -> App microphone
  -> Headphones  -> You hear it locally
```

## VoiceMeeter setup

1. Install VoiceMeeter.
2. Set MemeBlip `Mic route output` to `VoiceMeeter Input`.
3. Set the target app microphone to the matching `VoiceMeeter Output`.
4. Use VoiceMeeter to mix your real mic and MemeBlip if you want both at the same time.

## Important limitation

If you set the target app microphone to only `CABLE Output`, the target app may hear MemeBlip sounds but not your real microphone.

To mix your voice and MemeBlip together, use VoiceMeeter or another mixer. A simple VB-CABLE-only setup routes MemeBlip audio, not your physical mic, unless you configure an additional mixer.

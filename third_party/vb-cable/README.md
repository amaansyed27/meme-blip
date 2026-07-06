# VB-CABLE third-party bundle

MemeBlip can use VB-CABLE as its MVP virtual audio route while the native MemeBlip driver is deferred.

VB-CABLE is developed by VB-Audio Software, not MemeBlip.

Official source:

```text
https://vb-audio.com/Cable/
```

Licensing/distribution notes:

- Standard VB-CABLE is donationware.
- End users must be able to identify it as VB-Audio software.
- End users must be told VB-CABLE is donationware and that participation/donation is welcome.
- VB-CABLE A+B / C+D are not bundled here.

Expected Windows devices after install:

```text
Playback/output device: CABLE Input
Recording/input device: CABLE Output
```

MemeBlip route:

```text
Real microphone -> MemeBlip passthrough -> CABLE Input
Meme sounds     -> MemeBlip playback     -> CABLE Input
Target app mic  -> CABLE Output
```

The installer helper may download `VBCABLE_Driver_Pack45.zip` into this folder. Do not commit the binary ZIP unless licensing/compliance is explicitly reviewed for the distribution channel.

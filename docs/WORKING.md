# How MemeBlip Works

MemeBlip lets you play short audio clips into games, calls, and meetings without changing your normal speaker setup.

## Basic idea

Target apps such as Valorant, CS, Overwatch, Google Meet, or Zoom need to hear MemeBlip as a microphone.

VB-CABLE provides that virtual microphone route:

```text
CABLE Input  ->  CABLE Output
```

MemeBlip sends audio to `CABLE Input`. The target app uses `CABLE Output` as its microphone.

## Normal setup

In MemeBlip:

```text
Real mic source: your physical microphone
Virtual route: CABLE Input
Monitor output: your headphones/speakers
Mic passthrough: On if you want voice included
```

In the target app:

```text
Microphone: CABLE Output
Speaker: your normal headphones/speakers
```

## Clip playback

When a clip is triggered by a hotkey or routed action:

```text
Imported audio file
-> MemeBlip native companion
-> selected virtual route, usually CABLE Input
-> target app hears it through CABLE Output
```

If monitor output is selected, MemeBlip also plays the clip locally:

```text
Imported audio file
-> monitor output
-> headphones/speakers
```

Library preview is separate from mic routing:

```text
Library play button
-> local preview endpoint
-> default Windows speaker/headphone output
```

This lets you test imported sounds without needing the virtual mic route to be configured.

## Voice / mic passthrough

If mic passthrough is enabled:

```text
Physical microphone
-> MemeBlip passthrough stream
-> CABLE Input
-> target app hears your voice through CABLE Output
```

This is how MemeBlip keeps your real voice and meme clips in one microphone path.

MemeBlip handles common format mismatches by converting microphone input to mono and resampling when needed.

## MyInstants supplier

The **Sounds → Get more** page lets users find sounds without leaving MemeBlip.

Flow:

```text
Search/trending/recent/best
-> preview sound in supplier page
-> Add to MemeBlip
-> local companion downloads the MP3
-> sound is saved locally
-> sound appears in the active board
```

MemeBlip uses the public MyInstants API wrapper from `abdipr/myinstants-api` through:

```text
https://myinstants-api.vercel.app
```

The supplier UI calls:

```text
/search?q=<query>
/trending?q=us
/recent
/best?q=us
```

The native companion imports through:

```text
POST /sounds/import-url
```

For safety and reliability, the companion only accepts MyInstants media URLs from:

```text
https://www.myinstants.com/media/sounds/
https://myinstants.com/media/sounds/
```

Remote sounds become local clips after import, so hotkeys do not depend on MyInstants being online later.

## Soundboards

Soundboards are not fake folders. They are generated from clip metadata.

Each clip has a `board` field. The dashboard groups clips by that field.

When a board is active:

```text
Only clips from that board respond to hotkeys.
```

When no board is active:

```text
All boards can respond to hotkeys.
```

## Hotkeys

The native companion polls keys on Windows.

Hotkey loop:

```text
read sounds from storage
read active board from settings
register usable hotkeys for matching sounds
when key combo is pressed, play the linked clip
```

Valorant push-to-talk flow:

```text
Hold V -> press MemeBlip hotkey -> clip transmits -> release V
```

For games with aggressive input handling, run the companion as Administrator if hotkeys do not fire in-game.

## Updates

The companion can check GitHub Releases and compare the latest release with the current native version.

The update feature is intentionally simple:

```text
check release -> show update state -> download matching Windows asset if available
```

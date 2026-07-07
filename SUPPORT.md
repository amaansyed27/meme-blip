# Support

Use this file to collect the information needed for debugging MemeBlip issues.

## Before asking for help

Check:

- VB-CABLE is installed.
- MemeBlip companion is running.
- Dashboard opens locally.
- Target app microphone is set to `CABLE Output`.
- MemeBlip virtual route is set to `CABLE Input`.
- Monitor output is your normal headphones or speakers.

## Useful details to include

- Windows version.
- MemeBlip commit or release version.
- Companion terminal output.
- Screenshot of Audio Routing.
- Screenshot of target app microphone settings.
- Whether clip playback works inside MemeBlip.
- Whether hotkeys fire outside a game.

## Common commands

Stop the companion if it is stuck:

```powershell
npm run companion:stop
```

Start the companion:

```powershell
npm run companion
```

Start the dashboard:

```powershell
npm run dev
```

# MemeBlip Manual Testing Checklist

Use this after pulling the latest `main`.

## 1. Start both processes

Terminal 1:

```bash
npm run companion
```

Expected companion logs:

```text
MemeBlip tray event loop started
MemeBlip tray ready. Dashboard: http://127.0.0.1:48321
MemeBlip companion running on http://127.0.0.1:48322
```

Terminal 2:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:48321
```

## 2. Tray test

- Click or right-click the MemeBlip tray icon.
- Confirm menu appears.
- Click `Open Dashboard`.
- Confirm browser opens the dashboard.
- Click `Open API Health`.
- Confirm browser opens a JSON response from `/health`.

## 3. Companion API health test

Open this URL:

```text
http://127.0.0.1:48322/health
```

Expected:

```json
{
  "ok": true,
  "version": "0.1.0",
  "apiToken": "..."
}
```

## 4. Dashboard connection test

In the dashboard sidebar, confirm companion status shows online.

If it says offline:

- confirm `npm run companion` is still running
- refresh the browser
- open `/health` manually

## 5. Import sound test

- Go to `Sounds`.
- Click `Import clips`.
- Import a small `.mp3`, `.wav`, or `.ogg` file.
- Confirm it appears in the sound grid.
- Restart the companion and refresh the dashboard.
- Confirm the imported sound still appears.

## 6. Playback test

- Click the play button on the imported sound.
- Confirm audio plays through the selected output device.
- Click `Stop all` while a longer sound is playing.
- Confirm playback stops.

## 7. Output device test

- Go to `Audio Routing`.
- Confirm output devices are listed.
- Select your headphones first.
- Play a sound.
- Then select VB-CABLE / VoiceMeeter / another virtual route if installed.
- Play again and check the target app receives the sound.

## 8. Hotkey test

- Go to `Hotkeys`.
- Set a simple hotkey such as `Alt + 1` on one sound.
- Wait 2-3 seconds for the companion hotkey rescan.
- Press the hotkey while dashboard is not focused.
- Confirm the sound plays.

Avoid hotkeys already used by Windows, browser, Discord, or the game.

## 9. Edit library test

On the `Sounds` page:

- Rename a sound.
- Change its board name.
- Adjust volume.
- Refresh the page.
- Confirm changes persist.

## 10. Delete test

- Delete a test sound from the `Sounds` page.
- Refresh the page.
- Confirm it does not reappear.

## 11. Packaged build test

Run:

```bash
npm run package:windows
```

Expected output:

```text
release/MemeBlip-Windows/MemeBlip.exe
release/MemeBlip-Windows/dist/
release/MemeBlip-Windows.zip
```

Then run:

```text
release/MemeBlip-Windows/MemeBlip.exe
```

Open:

```text
http://127.0.0.1:48322
```

Confirm the dashboard loads without `npm run dev`.

## 12. Update test

This only works after a GitHub Release exists.

- Create and push a tag like `v0.1.1`.
- Let GitHub Actions publish release assets.
- Open `Settings`.
- Click `Check` under Updates.
- Confirm it finds the newer release.
- Click Download.
- Confirm the downloaded asset opens.

## Known limitations

- Audio duration currently shows `--`.
- Route test endpoint currently verifies the API path, not a generated test tone.
- Installer/startup behavior needs validation after the first GitHub Release build.

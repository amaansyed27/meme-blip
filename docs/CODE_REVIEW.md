# MemeBlip Code Review

## Current product direction

MemeBlip stays focused on the reliable MVP:

```text
Uploaded clips + physical mic passthrough -> CABLE Input -> CABLE Output -> game/call microphone
Monitor output -> user headphones/speakers
```

System-audio routing was removed from the product path because it is unreliable with plain VB-CABLE and does not monitor cleanly.

## Completed cleanup

- Removed fake folder controls from the Sounds page.
- Removed display-only board rules from the Soundboards page.
- Converted Soundboards into real active boards.
- Added native `active_board` setting.
- Added `/settings/active-board` API route.
- Scoped native hotkey registration to the active board.
- Removed unused fake seed exports for starter sounds, fake boards, and fake devices.
- Removed unused `driver::open_script` helper that caused a compiler warning.
- Removed unused `global-hotkey` dependency after replacing it with Windows polling hotkeys.
- Removed stale system-audio helper scripts and npm scripts.
- Made CI steps explicit for frontend and native builds.
- Hardened frontend TypeScript module resolution for CI.
- Split `native/src/api.rs` into auth, error, and route modules.
- Split `useMemeBlipStore.js` into focused Zustand slices.
- Split broad product CSS into theme, layout, sounds, routing, hotkeys, and shared utility styles.
- Switched the visual language to a lower-radius grey-black paper dark theme with a paper light theme.

## Product behavior now

### Sounds

- Shows real imported clips only.
- Board filter chips are derived from actual clip metadata.
- Importing while a board is active adds the clip to that board.
- No fake folders remain.

### Soundboards

- Boards are derived from actual clips.
- Selecting a board persists it as the active board.
- Active board scopes global hotkeys at the native companion layer.
- `Use all boards` removes the hotkey scope.

### Hotkeys

- Windows polling hotkeys replace the fragile `global-hotkey` listener.
- Companion logs registered hotkeys and fired hotkeys.
- Valorant preset is PTT-friendly: hold `V`, then press `F1`-`F8`.

## Current module layout

### Native API

```text
native/src/api.rs
native/src/api/auth.rs
native/src/api/error.rs
native/src/api/routes/mod.rs
native/src/api/routes/devices.rs
native/src/api/routes/settings.rs
native/src/api/routes/sounds.rs
native/src/api/routes/system.rs
```

Update check/download handlers remain in `api.rs` because the connector blocked creating a dedicated updates route module during this pass. Functionally they are still isolated at the bottom of the API root.

### Frontend state

```text
app/src/state/useMemeBlipStore.js
app/src/state/boardUtils.js
app/src/state/slices/appSlice.js
app/src/state/slices/audioSlice.js
app/src/state/slices/soundSlice.js
app/src/state/slices/uiSlice.js
```

### Styles

```text
app/src/styles/theme.css
app/src/styles/layout.css
app/src/styles/sounds.css
app/src/styles/routing.css
app/src/styles/hotkeys.css
app/src/styles/product.css
```

## Remaining architecture debt

- Move update check/download handlers into `native/src/api/routes/updates.rs` when connector edits allow it.
- Replace the parked WDK driver path only after there is a working native driver build/install/test loop.
- Add regression tests or scripted checks for audio routing, clip import, active board hotkeys, and Valorant PTT flow.
- Add a dedicated release workflow after final local testing.

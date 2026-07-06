# MemeBlip Code Review

## Current product direction

MemeBlip should stay focused on the reliable MVP:

```text
Uploaded clips + physical mic passthrough -> CABLE Input -> CABLE Output -> game/call microphone
Monitor output -> user headphones/speakers
```

System-audio routing was removed from the product path because it is unreliable with plain VB-CABLE and does not monitor cleanly.

## Fixed in this cleanup pass

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

## Remaining architecture debt

### Native API file is still too large

`native/src/api.rs` still contains routing, auth, settings mutation, upload handling, sound CRUD, and update endpoints in one file. Split next into:

```text
native/src/api/mod.rs
native/src/api/auth.rs
native/src/api/routes/sounds.rs
native/src/api/routes/settings.rs
native/src/api/routes/devices.rs
native/src/api/routes/updates.rs
```

### Frontend store is still too broad

`app/src/state/useMemeBlipStore.js` owns app navigation, devices, sounds, boards, hotkeys, updates, and errors. Split next into smaller slices:

```text
app/src/state/slices/audioSlice.js
app/src/state/slices/soundSlice.js
app/src/state/slices/boardSlice.js
app/src/state/slices/uiSlice.js
```

### Product CSS is still too broad

`app/src/styles/product.css` still carries global product overrides, sound cards, routing, light theme, and layout tweaks. Split next into:

```text
app/src/styles/layout.css
app/src/styles/sounds.css
app/src/styles/routing.css
app/src/styles/theme-light.css
```

### Driver folder is parked, not product-ready

The WDK driver path is intentionally parked. Keep it out of the main product UI until there is a working native driver build/install/test loop.

## Next cleanup priority

1. Split `native/src/api.rs` into API route modules.
2. Split `useMemeBlipStore.js` into focused slices.
3. Move sound-card CSS out of `product.css`.
4. Add a CI check for `cargo check --manifest-path native/Cargo.toml` before the full native build.
5. Add a small regression checklist for audio routing, clip import, active board hotkeys, and Valorant PTT flow.

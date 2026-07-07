# Project Index

Simple map of important files and folders.

## Root

```text
README.md
```

Main project overview, setup, build commands, and links.

```text
LICENSE
```

MIT license.

```text
CONTRIBUTING.md
```

Contribution rules and product principles.

```text
SECURITY.md
```

Security policy and vulnerability reporting notes.

```text
SUPPORT.md
```

Support checklist for debugging user issues.

```text
LOGO_SETUP.md
```

Where app icons, tray icons, site icons, and favicons are wired.

```text
package.json
```

Node scripts for the dashboard, landing site, native companion, and Windows package flow.

```text
vite.config.js
```

Dashboard Vite configuration.

```text
vercel.json
```

Vercel configuration for deploying the public landing page from `site/`.

```text
tsconfig.json
```

Frontend typecheck/build configuration.

```text
.github/workflows/check.yml
```

CI check for dashboard build, landing site build, and native companion build.

```text
.github/workflows/release.yml
```

Windows release packaging workflow that uploads the MSI setup and portable zip to GitHub Releases.

## site/

Public MemeBlip landing page.

```text
site/index.html
```

Landing page HTML shell and favicon tags.

```text
site/vite.config.js
```

Landing page Vite config. It copies assets from root `assets/`.

```text
site/src/App.jsx
```

Single-page cinematic landing page with download CTA.

```text
site/src/styles.css
```

Landing page visual system, responsive layout, and hero animations.

## app/

Local dashboard.

```text
app/src/main.jsx
```

React entry point and style imports.

```text
app/src/App.jsx
```

Chooses which dashboard page to render based on the selected route.

```text
app/src/layouts/AppShell.jsx
```

Main shell with sidebar, topbar, theme toggle, and page transition.

```text
app/src/pages/
```

Dashboard pages: Dashboard, Sounds, Soundboards, Hotkeys, Audio Routing, Settings.

```text
app/src/components/
```

Reusable UI pieces such as `SoundCard`, `BoardCard`, `DeviceCard`, and `PageHeader`.

```text
app/src/services/companionClient.js
```

Frontend client for the local native companion API.

```text
app/src/state/
```

Zustand store and state slices.

```text
app/src/styles/
```

Split CSS files for theme, layout, sounds, routing, hotkeys, and shared utilities.

## native/

Rust native companion.

```text
native/Cargo.toml
```

Rust package and dependency configuration.

```text
native/src/main.rs
```

Native app entry point.

```text
native/src/api.rs
native/src/api/
```

Local API root and route modules.

```text
native/src/audio.rs
```

Audio playback, monitor output, device enumeration, and mic passthrough.

```text
native/src/hotkeys.rs
```

Windows hotkey polling and active-board scoped playback.

```text
native/src/storage.rs
```

Persistent settings and sound metadata.

```text
native/src/tray.rs
```

Native tray menu behavior.

```text
native/src/updater.rs
```

GitHub Release update checking/downloading.

```text
native/src/driver.rs
```

Parked driver status helper. The native driver path is not the current MVP.

## scripts/

Windows helper scripts.

```text
scripts/stop-companion.ps1
```

Stops local development ports and native companion leftovers.

```text
scripts/package-windows.ps1
```

Builds the dashboard, release companion, portable zip, generated icon, and MSI setup when WiX is installed.

## virtual-cable/

VB-CABLE helper scripts and notes.

```text
virtual-cable/check-vbcable.ps1
```

Checks whether VB-CABLE appears to be installed.

```text
virtual-cable/install-vbcable.ps1
```

Helper for installing VB-CABLE.

## docs/

Project documentation.

```text
docs/ARCHITECTURE.md
```

High-level system architecture.

```text
docs/WORKING.md
```

How clip playback, mic passthrough, soundboards, and hotkeys work.

```text
docs/INDEX.md
```

This file and folder map.

```text
docs/RELEASE.md
```

Release checklist and package notes.

```text
docs/VERCEL_DEPLOY.md
```

Vercel CLI deployment guide for the landing page.

```text
docs/CHANGELOG.md
```

Short project change history.

```text
docs/CODE_REVIEW.md
```

Cleanup history and architecture debt.

```text
docs/TODO.md
```

Future release and site tasks.

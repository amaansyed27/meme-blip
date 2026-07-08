# Project Index

Simple map of important files and folders.

## Root

```text
README.md
```

Main project overview, setup, build commands, architecture summary, and links.

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

Windows release packaging workflow that uploads the MSI setup to GitHub Releases.

## docs/

```text
docs/ARCHITECTURE.md
```

Runtime architecture, local API layout, audio routing, MyInstants supplier architecture, storage, hotkeys, and packaging.

```text
docs/WORKING.md
```

User-facing explanation of routing, preview playback, mic passthrough, MyInstants imports, soundboards, and hotkeys.

```text
docs/MYINSTANTS_SUPPLIER.md
```

Dedicated MyInstants supplier integration notes, API usage, remote import flow, playback behavior, and failure cases.

```text
docs/RELEASE.md
```

Release process and validation steps.

```text
docs/releases/v1.1.0.md
```

Release notes for the stable v1.1.0 build.

## site/

Public MemeBlip landing page.

```text
site/index.html
```

Landing page HTML shell, SEO metadata, favicon tags, Open Graph tags, Twitter card tags, and JSON-LD schema.

```text
site/vite.config.js
```

Landing page Vite config. It copies assets from root `assets/`.

```text
site/src/App.jsx
```

Single-page landing page with download CTA, GitHub star CTA, routing explanation, and install section.

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

Chooses which dashboard page to render based on the selected route and owns the first-run VB-CABLE setup gate.

```text
app/src/layouts/AppShell.jsx
```

Main shell with sidebar, topbar, theme toggle, and page transition.

```text
app/src/pages/Sounds.jsx
```

Clip library page. Includes local import and `Get more` supplier entry point.

```text
app/src/pages/MyInstants.jsx
```

MyInstants supplier page for search, trending/recent/best browsing, preview, and import.

```text
app/src/pages/
```

Dashboard pages: Dashboard, Sounds, MyInstants supplier, Soundboards, Hotkeys, Audio Routing, Settings.

```text
app/src/components/
```

Reusable UI pieces such as `SoundCard`, `BoardCard`, `DeviceCard`, and `PageHeader`.

```text
app/src/services/companionClient.js
```

Frontend client for the local native companion API.

```text
app/src/services/myInstantsClient.js
```

Frontend client for `https://myinstants-api.vercel.app`.

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
native/src/api/routes/sounds.rs
```

Sound listing, local import, MyInstants URL import, preview playback, routed playback, hotkeys, and deletion endpoints.

```text
native/src/audio.rs
```

Audio playback, local preview, monitor output, device enumeration, and mic passthrough.

```text
native/src/hotkeys.rs
```

Windows hotkey polling and active-board scoped playback.

```text
native/src/storage.rs
```

Persistent settings and sound metadata.

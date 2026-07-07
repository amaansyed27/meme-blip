# Logo and Icon Setup

Use this guide when replacing MemeBlip logos, tray icons, favicon, and future landing-page assets.

## Current active brand files

MemeBlip currently uses these pushed files:

```text
assets/brand/memeblip-logo.svg
assets/brand/memeblip-icon-1024.png
```

Vite is configured with:

```text
publicDir: 'assets'
```

That means files inside `assets/` are served from the site root.

Examples:

```text
assets/brand/memeblip-logo.svg      -> /brand/memeblip-logo.svg
assets/brand/memeblip-icon-1024.png -> /brand/memeblip-icon-1024.png
```

## Dashboard logo

Dashboard sidebar logo is wired in:

```text
app/src/layouts/AppShell.jsx
```

Current implementation:

```jsx
<img className="brand-mark-img" src="/brand/memeblip-icon-1024.png" alt="MemeBlip logo" />
```

Logo image styling is in:

```text
app/src/styles/layout.css
```

Class:

```css
.brand-mark-img
```

## Browser favicon

Browser favicon and Apple touch icon are wired in:

```text
index.html
```

Current tags:

```html
<link rel="icon" href="/brand/memeblip-logo.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/brand/memeblip-icon-1024.png" />
```

## Tray companion icon

The Rust tray companion embeds the pushed PNG at compile time.

Source file:

```text
assets/brand/memeblip-icon-1024.png
```

Wired in:

```text
native/src/tray.rs
```

Current implementation uses:

```rust
include_bytes!("../../assets/brand/memeblip-icon-1024.png")
```

The image is decoded and resized to `32x32` for `tray-icon`.

Dependency used:

```text
image
```

Configured in:

```text
native/Cargo.toml
```

## Windows package icon

Recommended future installer/shortcut icon:

```text
assets/brand/memeblip-windows.ico
```

Where to wire packaging later:

```text
scripts/package-windows.ps1
```

## Future landing page logo

When the landing page is added, use the same root assets first:

```text
assets/brand/memeblip-logo.svg
assets/brand/memeblip-icon-1024.png
```

If the landing page becomes a separate app later, copy or reference them as:

```text
site/public/memeblip-logo.svg
site/public/memeblip-mark.svg
site/public/favicon.svg
site/public/apple-touch-icon.png
```

## Asset naming checklist

Use these exact names where possible:

```text
memeblip-logo.svg
memeblip-logo.png
memeblip-mark.svg
memeblip-icon-1024.png
memeblip-windows.ico
favicon.ico
favicon.svg
apple-touch-icon.png
web-app-manifest-192x192.png
web-app-manifest-512x512.png
```

## Practical workflow

1. Export the master logo as SVG.
2. Export PNG at 1024x1024.
3. Put them in `assets/brand/`.
4. Keep `vite.config.js` using `publicDir: 'assets'`.
5. Use `/brand/...` paths in the dashboard and HTML.
6. Keep the tray icon using `include_bytes!` from `native/src/tray.rs`.
7. Wire landing-page icons later when the site exists.

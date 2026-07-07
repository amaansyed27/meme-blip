# Logo and Icon Setup

Use this guide when replacing MemeBlip logos, tray icons, favicon, and future landing-page assets.

## Recommended source files

Keep final source assets here:

```text
assets/brand/memeblip-logo.svg
assets/brand/memeblip-logo.png
assets/brand/memeblip-icon-1024.png
```

If `assets/brand/` does not exist yet, create it.

## Dashboard logo

Current UI mark is rendered as text `MB` in:

```text
app/src/layouts/AppShell.jsx
```

Recommended implementation after adding files:

1. Put the icon here:

```text
app/public/brand/memeblip-icon.svg
```

2. Replace the current brand mark span with an image:

```jsx
<img className="brand-mark-img" src="/brand/memeblip-icon.svg" alt="MemeBlip" />
```

3. Add or update CSS:

```css
.brand-mark-img {
  width: 34px;
  height: 34px;
  display: block;
}
```

## Browser favicon

Put these files in:

```text
app/public/favicon.ico
app/public/favicon.svg
app/public/apple-touch-icon.png
app/public/web-app-manifest-192x192.png
app/public/web-app-manifest-512x512.png
```

Then ensure the HTML references them. Check:

```text
index.html
```

Recommended tags:

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

## Tray companion icon

The Rust tray companion should use an `.ico` file on Windows.

Recommended file path:

```text
native/assets/tray/memeblip-tray.ico
```

Also keep PNG source versions:

```text
native/assets/tray/memeblip-tray-16.png
native/assets/tray/memeblip-tray-32.png
native/assets/tray/memeblip-tray-48.png
native/assets/tray/memeblip-tray-256.png
```

Where to wire it:

```text
native/src/tray.rs
```

Expected implementation shape:

```rust
let icon_path = std::path::PathBuf::from("native/assets/tray/memeblip-tray.ico");
```

If the tray library needs raw RGBA instead of `.ico`, load the PNG source and convert it into the icon format expected by `tray-icon`.

## Windows package icon

Recommended file:

```text
assets/brand/memeblip-windows.ico
```

Use this for future installer metadata and shortcuts.

Where to wire packaging:

```text
scripts/package-windows.ps1
```

## Future landing page logo

When the landing page is added, use:

```text
site/public/logo.svg
site/public/favicon.ico
site/public/favicon.svg
site/public/apple-touch-icon.png
```

Suggested naming:

```text
site/public/memeblip-logo.svg
site/public/memeblip-mark.svg
```

## Asset naming checklist

Use these exact names where possible:

```text
memeblip-logo.svg
memeblip-logo.png
memeblip-mark.svg
memeblip-icon-1024.png
memeblip-tray.ico
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
3. Generate favicon files from the PNG/SVG.
4. Generate `.ico` files for Windows tray/package usage.
5. Put files in the paths above.
6. Wire the dashboard image first.
7. Wire the tray icon second.
8. Wire landing-page icons later when the site exists.

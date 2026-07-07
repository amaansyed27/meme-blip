# Vercel Deployment

The public landing page lives in:

```text
site/
```

Vercel uses:

```text
vercel.json
```

## Commands

Install the CLI:

```bash
npm install -g vercel
```

Login:

```bash
vercel login
```

Deploy preview:

```bash
vercel
```

Deploy production:

```bash
vercel --prod
```

## Build settings

Build command:

```bash
npm install && npm run site:build
```

Output directory:

```text
site/dist
```

## Download button

The landing page uses this default release asset URL:

```text
https://github.com/amaansyed27/meme-blip/releases/latest/download/MemeBlip-Setup.msi
```

To override it in Vercel, set:

```text
VITE_MEMEBLIP_DOWNLOAD_URL=https://your-download-url
```

## Release asset flow

Create a version tag such as:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The Windows release workflow uploads the installer and portable zip to GitHub Releases. The landing page download button then points to the latest release asset.

## Local development

```bash
npm run site:dev
```

Open:

```text
http://127.0.0.1:48330
```

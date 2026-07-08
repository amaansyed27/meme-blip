# MyInstants Supplier

MemeBlip includes a supplier page for finding and importing meme sounds without leaving the app.

```text
Sounds -> Get more -> search/preview -> Add to MemeBlip
```

## External API

MemeBlip uses the public MyInstants API wrapper from:

```text
https://github.com/abdipr/myinstants-api
```

Runtime base URL:

```text
https://myinstants-api.vercel.app
```

Frontend client:

```text
app/src/services/myInstantsClient.js
```

Supported calls:

```text
GET /search?q=<query>
GET /trending?q=us
GET /recent
GET /best?q=us
```

The API returns sound records with fields such as:

```text
title
url
mp3
```

## Dashboard flow

Page:

```text
app/src/pages/MyInstants.jsx
```

User flow:

```text
User opens Sounds -> Get more
User searches or opens trending/recent/best
User previews a sound through the browser audio control
User clicks Add to MemeBlip
Dashboard sends title + mp3 URL to the local companion
```

## Local import flow

Native route:

```text
POST /sounds/import-url
```

Native handler:

```text
native/src/api/routes/sounds.rs
```

Import flow:

```text
Validate local API token
Validate MyInstants media URL
Download MP3 through Rust companion
Reject files larger than 20 MB
Write MP3 into local sounds directory
Create normal SoundClip metadata
Add clip to selected board
```

Allowed remote media prefixes:

```text
https://www.myinstants.com/media/sounds/
https://myinstants.com/media/sounds/
```

This keeps the importer narrow. MemeBlip is not a general remote file downloader.

## Playback behavior

After import, MyInstants sounds are normal local MemeBlip clips.

```text
Imported MyInstants sound
-> local file on disk
-> sound metadata in MemeBlip storage
-> library preview / board grouping / hotkeys
```

Library preview uses:

```text
POST /sounds/:id/preview
```

Hotkey and routed playback use:

```text
POST /sounds/:id/play
```

Preview goes to the user's normal output. Routed playback goes to the configured route, usually `CABLE Input`, so games and calls hear it through `CABLE Output`.

## Failure cases

Expected failures:

- MyInstants API is down.
- The specific MP3 URL is missing or removed.
- The user's internet connection is unavailable.
- The remote file is larger than 20 MB.
- The remote URL is not a MyInstants media URL.

If import fails, the dashboard shows the companion error message and does not add a partial clip.

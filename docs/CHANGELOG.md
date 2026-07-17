# Project Changelog

## 1.4.1 - 2026-07-18

- Fixed local sound imports failing when audio files exceeded Axum's default multipart body limit.
- Added a 20 MB per-clip limit with readable empty-file and oversized-file errors.
- Added sequential multi-file importing and a visible importing state.
- Reset the file picker after each attempt so the same file can be selected again.

## Unreleased

- Added local dashboard and native companion structure.
- Added clip import and playback workflow.
- Added soundboards from clip metadata.
- Added active board selection for hotkeys.
- Added audio routing docs and setup notes.
- Added release, support, security, and logo setup documentation.

Future tagged releases should add dated sections here.

# Security Policy

MemeBlip is a local-first desktop project. The dashboard talks to a native companion through localhost.

## Supported versions

Security fixes target the latest version on `main` until formal releases begin.

## Reporting a vulnerability

Please open a private report or contact the maintainer directly. Include:

- what happened
- affected version or commit
- operating system
- reproduction steps
- relevant logs or screenshots

Do not publicly share exploit details before a fix is available.

## Security principles

- Keep the local API bound to localhost.
- Require the local API token for dashboard requests.
- Avoid remote code execution features.
- Avoid fake or hidden background behavior.
- Keep third-party binaries out of the repository unless their license permits redistribution.

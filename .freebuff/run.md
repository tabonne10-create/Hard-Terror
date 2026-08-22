# BIDE – Static Site Preview

## Reproduce from a fresh checkout

This project has **no build step** — pure HTML/CSS/JS files.

No dependencies to install. No `.env` files needed.

## How to run the server

The server is a simple Node.js static file server at `.freebuff/server.js`.

```bash
node .freebuff/server.js
```

- Serves the project root on `http://localhost:4001`
- Falls back to `/Desktop/laverie/index.html` for `/`
- MIME types handled: `.html`, `.css`, `.js`, `.jpg`, `.jpeg`, `.png`, `.svg`, `.ico`

## Project structure

- `Desktop/laverie/` — Light theme (index, a-propos, tarifs, contact)
- `lavage1/lavage/` — Dark theme unified (index, a-propos, services, client)
- Pages in `lavage1/lavage/` link to `Desktop/laverie/` for tarifs and contact

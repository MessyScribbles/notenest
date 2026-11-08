# NoteNest

A real-time collaborative document editor with live cursors, file viewing, friends, and 1-to-1 chat. Built as a student project with React, Node.js, Yjs, and PostgreSQL.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-In%20development-orange.svg)](#roadmap)

## Screenshots

<p align="center">
    <img src="screenshots/darkmode.png" width="400" alt="Dark mode dashboard"/>
    <img src="screenshots/dashboard.png" width="400" alt="Dashboard"/>
</p>


<details>
<summary>More screenshots</summary>

<p align="center">
  <img src="screenshots/login.png" width="400" alt="Login"/>
  <img src="screenshots/writing.png" width="400" alt="Editor"/>
  <img src="screenshots/darkmodeWRITING.png" width="400" alt="Dark mode editor"/>
</p>
</details>

## Features

**Editor**
- Page settings, find and replace, outline panel, tables

**Collaboration**
- Roles per note: owner, editor

**Files**
- View and import TXT, PDF and DOCX files

**Social and productivity**
- Friend requests by email, with live notifications
- 1-to-1 chat with typing indicator and presence
- Task list
- Dark mode and a built-in music player

## Tech stack

| Layer | Technology | Why |
| :--- | :--- | :--- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS | Fast dev server, typed components |
| Editor and sync | TipTap 2, Yjs, Hocuspocus | Rich text editing with conflict-free merging of concurrent edits |
| Backend | Node.js, Express, Socket.IO | REST API plus event-based chat and notifications |
| Data | PostgreSQL (Supabase), Prisma | Relational data with typed queries |
| Files | Supabase Storage | Hosted object storage for images and uploads |

## Architecture

```mermaid
graph TD
    Client[React client] -->|REST /api| Express[Express server]
    Client -->|WebSocket /ws| Hocuspocus[Hocuspocus]
    Client -->|Socket.IO| Chat[Socket.IO]
    Express --> Prisma[Prisma]
    Hocuspocus --> Prisma
    Chat --> Prisma
    Prisma --> DB[(PostgreSQL on Supabase)]
    Express --> Storage[Supabase Storage]
```

A keystroke changes the local Yjs document, which produces a small binary update. The update goes over the WebSocket at `/ws` to Hocuspocus, which forwards it to every other client on the same note. Hocuspocus checks the user's token and note permission when the connection opens. Every few seconds, `onStoreDocument` saves the full document state to the `crdtData` column of the note in PostgreSQL, and `onLoadDocument` restores it when the note is opened again.

## Getting started

### Prerequisites

- Node.js (developed on v24.12.0)
- A Supabase project (PostgreSQL database and a private storage bucket)

### Supabase setup

1. Create a Supabase project and copy its connection strings and API keys.
2. In Storage, create a **private** bucket and put its name in `SUPABASE_STORAGE_BUCKET`.
3. The service role key stays on the server only. Never commit it or use it in client code.

### Install and run

```bash
git clone https://github.com/MessyScribbles/notenest.git
cd notenest

cd client && npm install
cd ../server && npm install
```

Create the server environment file from the template, then fill in your values:

```bash
# macOS / Linux
cp .env.example .env

# Windows (cmd)
copy .env.example .env
```

Generate the Prisma client and create the tables:

```bash
npx prisma generate
npx prisma db push
```

Start the server and the client in two terminals:

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm run dev
```

### Environment variables (`server/.env`)

| Name | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | Express and WebSocket port | `4000` |
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection string | `postgresql://user:pass@host:6543/db?pgbouncer=true` |
| `DIRECT_URL` | Yes | Direct connection used by `prisma db push` | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Yes | Secret used to sign tokens | `change-me` |
| `SUPABASE_URL` | Yes | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side Supabase key | `eyJ...` |
| `SUPABASE_STORAGE_BUCKET` | Yes | Name of the private bucket | `note-files` |

### Verify it works

Open the client in two different browsers, log in with two accounts, share a note, and open it in both. Typing in one window should appear in the other, with the other user's cursor visible.

### Windows port error

If the server fails with `EACCES` on its port, Windows may have reserved that port range. Check with:

```bash
netsh interface ipv4 show excludedportrange protocol=tcp
```

Choose a port outside every listed range, set it as `PORT` in `server/.env`, and update the API and WebSocket URLs in the client to the same port.

## Project structure

```
notenest/
├── client/                 React app (Vite)
│   └── src/
│       ├── components/     dashboard, document, editor, layout, modals, ui
│       ├── context/        audio player state
│       ├── extensions/     custom TipTap extensions (font size, line height, page break)
│       ├── lib/            page settings
│       └── styles/         document and page styles
├── server/                 Express API, Hocuspocus, Socket.IO
│   ├── prisma/             schema and seed script
│   └── src/index.ts        server entry point
├── screenshots/            images used in this README
├── docker-compose.yml
└── package.json            root helper dependencies
```

## Security

**Implemented**
- JWT authentication
- Token and note-permission check when a Hocuspocus connection opens
- Role-based editing: viewers cannot modify a note
- File type and size validation on uploads
- HTML sanitization with DOMPurify for imported DOCX content

**Not implemented**
- End-to-end encryption of notes
- Transport encryption by default (local runs use HTTP and WS; HTTPS and WSS depend on how you deploy)
- CSRF protection and httpOnly cookie sessions
- Automated security tests

## Known limitations

- Pages are a visual simulation (page guides and manual page breaks), not true automatic pagination.
- All API routes live in one file, `server/src/index.ts`.
- The production client bundle is large (about 1.5 MB main chunk plus a 1.27 MB PDF worker) because the editor and PDF viewer are not code-split.
- No automated tests.
- Single server instance, with no multi-node scaling for WebSockets.
- Legacy `.doc` files are not supported (use `.docx` or PDF).
- Storage and database limits depend on the Supabase plan.

## Roadmap

- [ ] Split the API into route modules
- [ ] Code-split the editor and PDF viewer
- [ ] Add unit and integration tests
- [ ] End-to-end encryption for notes
- [ ] Stylus ink layer synced through Yjs
- [ ] Deployment guide with HTTPS and WSS

## Contributing

Create a feature branch from `main`, keep commits focused, and open a pull request describing the change and how you tested it.

## License

MIT. See [LICENSE](LICENSE).

## Author

Built by MessyScribbles and MoadMoad

- GitHub: [@MessyScribbles](https://github.com/MessyScribbles)
- Github: [https://github.com/MoadMouad](url)

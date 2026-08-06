# Spark Quiz

Live classroom quiz website — English with Rida.

## Run it

```
npm install
npm start
```

Then open:
- http://localhost:3000/admin.html — log in and edit the question bank (default password: `sparkquiz2026` — change it, see below)
- http://localhost:3000/host.html — teacher's projected screen (creates a game + PIN)
- http://localhost:3000/join.html — students go here, enter the PIN shown on the host screen

## Question types

The admin panel supports two question types:
- **Multiple choice** — 2–4 answers, edit text freely, mark one correct.
- **True / False** — fixed two answers, just choose which one is correct.

Each question can also optionally include:
- **An image** — shown to students above the question text (for reading/vocab questions).
- **Audio** — shown as a play button; use for listening questions ("listen and choose what you hear").

## Change the admin password

Set an environment variable before starting the server:

```
ADMIN_PASSWORD=your-new-password npm start
```

Also set `AUTH_SECRET` to a random string in production — it signs the admin login cookie.

## How it works

- `server.js` — Express + WebSocket backend.
- `db.js` — SQLite (via better-sqlite3), stored in `data/sparkquiz.db`. Questions and finished-game results persist here. Live game sessions (PIN, connected players, in-progress state) stay in memory — a server restart clears any game in progress, but saved questions and past results survive.
- `public/` — join.html, host.html, play.html, admin.html — all wired to the backend over REST + WebSocket.
- `public/uploads/` — uploaded question images and audio files, served statically.

## Try the full flow

1. Open `/admin.html`, log in, and check out or edit the sample Unit 1 questions (multiple choice + true/false, some with room for images/audio).
2. Open `/host.html` in one tab — note the PIN.
3. Open `/join.html` in another tab (or your phone on the same network, using your computer's local IP instead of localhost) — enter the PIN, pick a nickname and avatar.
4. Back on the host tab, click "Start game" once at least one student has joined.
5. Answer on the student tab — watch the live bar chart update on the host tab.
6. Click "Lock answers & reveal" then "Show standings" to advance through the game.

## Known limits

- Live game sessions are in-memory — a server restart drops any game in progress. Questions and finished results are safe in SQLite.
- Single shared admin password, not per-teacher accounts.
- No reconnect-and-resync yet if a student's browser refreshes mid-game.
- Not deployed anywhere yet — see the deployment notes you already have for hosting options (Render, Railway, Fly.io all support this out of the box; avoid static-only hosts since this needs a running Node process + WebSockets).
- On most hosting platforms, the local disk (including `data/sparkquiz.db` and `public/uploads/`) is wiped on redeploys/restarts unless you attach a persistent volume — worth checking before relying on it in production.

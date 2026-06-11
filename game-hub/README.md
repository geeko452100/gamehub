# Game Hub (Frontend)

React + Vite client for Gamer Stronghold, backed by Supabase BaaS.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

In the Supabase dashboard, add `http://localhost:5173/reset-password` to Auth redirect URLs.

## Supabase integration

Shared client and auth live in `src/lib/supabase/`:

- `client.js` — Supabase singleton
- `AuthProvider.jsx` — Session + profile provider
- `profilePersistence.js` — Profile updates and avatar uploads (Storage)
- `puzzlePersistence.js` — Server-driven daily puzzle words (RPC)

### Database

Schema migrations are in `supabase/migrations/`. From this directory:

```bash
npm run db:link -- --project-ref <your-project-ref>
npm run db:push
```

Tables and RPCs cover auth profiles, card-battler PvP matchmaking, idle cloud saves, puzzle results, daily puzzles, avatars storage, and leaderboards.

### Edge functions

Seed upcoming daily puzzle words (optional cron target):

```bash
npm run functions:deploy
curl -X POST "https://<project-ref>.supabase.co/functions/v1/seed-daily-puzzle?days=14"
```

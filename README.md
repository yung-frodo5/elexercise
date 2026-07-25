# Exercise Tracker

A collaborative exercise-tracking platform: database, API, website, and mobile app.

## Structure

```
exercise-tracker/
├── apps/
│   ├── web/       # Next.js website
│   ├── mobile/    # Expo / React Native iOS app (see apps/mobile/README.md)
│   └── api/       # Express API, storage-backend-agnostic
├── packages/
│   ├── shared-types/   # TS types shared by api, web, and mobile
│   └── design-tokens/  # colors/typography/spacing/icons shared by web and mobile
└── supabase/      # Postgres schema (migrations), RLS policies
```

## Storage strategy

Data lives in Supabase (Postgres) — see `supabase/migrations/` for the
schema (`machines`, `workouts`, `sessions`, `power_samples`) and RLS
policies. All reads/writes go through the `WorkoutRepository` interface in
`apps/api/src/repositories/WorkoutRepository.ts`; the only concrete
implementation is `SupabaseWorkoutRepository`, constructed with the
service-role key (see `apps/api/.env.example`). Route handlers never import
a concrete repository directly — only `server.ts` does — so swapping storage
backends later stays a contained change.

The Express API itself doesn't issue sessions — clients (web, mobile)
authenticate directly against Supabase and pass the resulting JWT as
`Authorization: Bearer <token>` on every request. `apps/api/src/middleware/auth.ts`
verifies that token and resolves it to a user id before any route handler runs.

## Visual design tokens

Colors, typography, spacing, and icons are centralized in
`packages/design-tokens` (same plain-TS, no-build-step conventions as
`packages/shared-types`) and re-exported as a single `theme` object, imported
by both `apps/web` (inline `style={{}}` props) and `apps/mobile`
(`StyleSheet.create`). Icons are plain Unicode/emoji glyphs rather than a
vector icon font or component set, so they render identically with a plain
`<span>`/`<Text>` on either platform with no extra dependency or native
linking required. Never hardcode a hex color, font size/weight, spacing
value, or icon glyph in a component — add or reuse a token in
`packages/design-tokens/src/` instead, so a visual change only has to happen
in one place.

See `CONTRIBUTING.md` for local setup and PR conventions.

## Deployment

The app is live at [elexercise.org](https://elexercise.org) (redirects to
`https://www.elexercise.org`):

| Service | Role | Notes |
|---|---|---|
| **Vercel** | Hosts `apps/web` (Next.js) | Root Directory is `apps/web`; auto-deploys on push to `main`. Build requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` as build-time env vars (see `apps/web/.env.example`). |
| **Render** | Hosts `apps/api` (Express) at `https://elexercise-api.onrender.com` | Deployed from the root `render.yaml` blueprint; auto-deploys on push to `main`. Needs `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `ALLOWED_ORIGIN` set in the Render dashboard (see `apps/api/.env.example`). |
| **Supabase** | Postgres database + auth (production project) | Separate from local/dev Supabase; the env vars above point the web app and API at it. |
| **Squarespace Domains** | Registrar/DNS for `elexercise.org` | DNS records point the apex and `www` at Vercel, which issues and manages TLS. |

The web app calls the API cross-origin, so the API's `ALLOWED_ORIGIN` env var
must list every origin allowed to call it (currently `elexercise.org` and
`www.elexercise.org`) — add a new one there before pointing a new frontend
origin at the API.

## Quick start

```bash
npm install
npm run dev:api    # http://localhost:3001
npm run dev:web    # http://localhost:3000
npm run dev:mobile # Expo dev server; press `i` for iOS Simulator
```

See `apps/mobile/README.md` for one-time Mac/Xcode setup.

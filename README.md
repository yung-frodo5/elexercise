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
│   ├── shared-types/   # TS types shared by api, web, and mobile (see packages/shared-types/README.md)
│   ├── design-tokens/  # colors/typography/spacing/icons shared by web and mobile (see packages/design-tokens/README.md)
│   └── content/        # article/rich-text content shared by web and mobile (see packages/content/README.md)
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

There's no real hardware telemetry pipeline yet, so the API fills
`power_samples` with **simulated** data instead: while a session is
`in_progress`, `apps/api/src/services/fakePowerSimulator.ts` writes one fake
`PowerSample` every 500ms (via `apps/api/src/services/fakePowerProfile.ts`,
which shapes plausible power curves per activity — steadier for cardio,
spike-and-decay reps for strength), stopping the moment that session stops
being `in_progress`. Everything with "fake" in its name is this simulation
only; `WorkoutRepository.insertPowerSample` itself is a plain storage write
that a future real-telemetry ingestion path would reuse unchanged.

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

## Shared content model

Article content (title, author(s), and an ordered body of paragraphs,
subtitles, and graphics) for screens like the landing page is centralized in
`packages/content` (same plain-TS, no-build-step conventions as
`packages/shared-types`/`packages/design-tokens`) so it's authored once and
consumed by both `apps/web` and `apps/mobile` — copy and article-integral
imagery belong there, not hardcoded per app. Rich text is a flat run —
`{ text, bold?, italic?, underline?, href? }` — rather than a variant tag, so
a single run can be bold *and* italic *and* a link at once. Graphics are
referenced by a logical key only, never a binary or a URL: each app keeps
its own actual image file (any format or crop) and maps the key to it in its
own `lib/content/graphicAssets.ts`. See `packages/content/README.md` and
`CONTRIBUTING.md` ("Content changes") for the full model, asset conventions,
and the one narrow exception for web-only decorative images.

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

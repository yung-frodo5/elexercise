# Contributing

## Setup

```bash
npm install
```

The API needs a Supabase project (local via the Supabase CLI, or hosted) —
see `apps/api/.env.example` for the required env vars
(`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_ANON_KEY`/`ALLOWED_ORIGIN`)
and `apps/web/.env.example`/`apps/mobile/.env.example` for the client-side
equivalents.

## Running things locally

```bash
npm run dev:api   # starts the API on http://localhost:3001
npm run dev:web   # starts the web app on http://localhost:3000
```

The web app talks to the API via `NEXT_PUBLIC_API_URL` (defaults to
`http://localhost:3001`).

## Branching

- Branch off `main`: `feature/<short-description>` or `fix/<short-description>`.
- Keep branches short-lived — rebase/merge `main` in frequently to avoid big
  conflicts, especially in `packages/shared-types`.
- Open a PR early (draft is fine) so others can see what's in flight.

## Data model changes

If you change anything in `packages/shared-types`, that's a contract change
for every app. In your PR:
1. Update the type in `shared-types`.
2. If it affects storage, add a new migration under `supabase/migrations/`
   (never edit an already-applied one) and update
   `SupabaseWorkoutRepository`'s row mapping
   (`apps/api/src/repositories/SupabaseWorkoutRepository.ts`).
3. Update any affected route validation.
4. Flag it clearly in the PR description so mobile/web folks notice.

## Storage backend

All persistence goes through the `WorkoutRepository` interface
(`apps/api/src/repositories/WorkoutRepository.ts`). Never import
`SupabaseWorkoutRepository` (or any future concrete implementation) directly
into route handlers or business logic — only `server.ts` should instantiate a
concrete repository. Every repository method takes `userId` and scopes its
query by it — the repository runs on the service-role key (bypasses RLS), so
ownership has to be enforced in the repository itself, not assumed.

## Deployment

`apps/web` deploys to **Vercel** and `apps/api` deploys to **Render**
(via the root `render.yaml` blueprint); both are connected to this GitHub
repo and auto-deploy on push to `main` — there's no manual deploy step.

A few things that trip people up:
- `NEXT_PUBLIC_*` vars are inlined into the Vercel build at build time.
  Changing one in the Vercel dashboard doesn't take effect until you trigger
  a new deployment (Deployments tab → "..." → Redeploy).
- The API has no CORS allowance by default. `ALLOWED_ORIGIN` on Render
  (comma-separated list) controls which origins may call it — add a new
  entry there before pointing any new frontend origin (e.g. a preview
  deployment) at the API.
- Production secrets (Supabase service-role key, etc.) live only in the
  Vercel/Render dashboards. Never commit real values — `.env.example` files
  should stay placeholder-only.

## Before opening a PR

```bash
npm run typecheck
npm run lint
npm run test
```

CI runs the same checks — running them locally first saves a round trip.

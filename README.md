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
│   └── shared-types/   # TS types shared by api, web, and mobile
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

See `CONTRIBUTING.md` for local setup and PR conventions.

## Quick start

```bash
npm install
npm run dev:api    # http://localhost:3001
npm run dev:web    # http://localhost:3000
npm run dev:mobile # Expo dev server; press `i` for iOS Simulator
```

See `apps/mobile/README.md` for one-time Mac/Xcode setup.

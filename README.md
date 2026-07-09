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
├── data/          # CSV storage for early development
└── .github/       # CI workflow, PR template
```

## Storage strategy

Data starts as CSV files in `data/` and is designed to move to a real
database later without a rewrite. All reads/writes go through the
`WorkoutRepository` interface in
`apps/api/src/repositories/WorkoutRepository.ts`. The only concrete
implementation right now is `CsvWorkoutRepository`; adding a
`PostgresWorkoutRepository` (or Supabase, etc.) later means implementing that
interface and changing one line in `apps/api/src/server.ts`.

See `CONTRIBUTING.md` for local setup and PR conventions.

## Quick start

```bash
npm install
npm run dev:api    # http://localhost:3001
npm run dev:web    # http://localhost:3000
npm run dev:mobile # Expo dev server; press `i` for iOS Simulator
```

See `apps/mobile/README.md` for one-time Mac/Xcode setup.

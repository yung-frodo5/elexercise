# Contributing

## Setup

```bash
npm install
```

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
2. Update the CSV repository's row mapping if it affects storage
   (`apps/api/src/repositories/CsvWorkoutRepository.ts`).
3. Update any affected route validation.
4. Flag it clearly in the PR description so mobile/web folks notice.

## Storage backend

All persistence goes through the `WorkoutRepository` interface
(`apps/api/src/repositories/WorkoutRepository.ts`). Never import
`CsvWorkoutRepository` (or any future concrete implementation) directly into
route handlers or business logic — only `server.ts` should instantiate a
concrete repository.

## Before opening a PR

```bash
npm run typecheck
npm run lint
npm run test
```

CI runs the same checks — running them locally first saves a round trip.

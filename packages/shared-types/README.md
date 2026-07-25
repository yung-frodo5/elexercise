# @exercise-tracker/shared-types

Core domain types (`Machine`, `Workout`, `Session`, `PowerSample`, and their
variants) shared by `apps/api`, `apps/web`, and `apps/mobile`. Plain
TypeScript, no build step — every consumer imports straight from `src/`, so
there's nothing to compile or publish.

## Structure

```
src/
└── index.ts   # all shared domain types
```

## Usage

```ts
import type { Workout, WorkoutWithSessions } from "@exercise-tracker/shared-types";
```

## Changing a type here

A change here is a contract change for every app. See `CONTRIBUTING.md` at
the repo root ("Data model changes") for the full checklist — in short:
update the type, add a new migration under `supabase/migrations/` if it
affects storage (never edit an already-applied one), update
`SupabaseWorkoutRepository`'s row mapping, and flag it clearly in the PR
description so mobile/web folks notice.

## Typecheck

```bash
npm run typecheck --workspace=packages/shared-types
```

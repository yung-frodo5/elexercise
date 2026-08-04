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
  conflicts, especially in `packages/shared-types` and `packages/design-tokens`.
- Open a PR early (draft is fine) so others can see what's in flight.

## Data model changes

If you change anything in `packages/shared-types`, that's a contract change
for every app. The same applies to `packages/leveling` and
`packages/workout-history` — they're shared cross-app code too (api and
both frontends for `leveling`; mobile for `workout-history`), so a change
there likewise ripples to every consumer. In your PR:
1. Update the type in `shared-types`.
2. If it affects storage, add a new migration under `supabase/migrations/`
   (never edit an already-applied one) and update
   `SupabaseWorkoutRepository`'s row mapping
   (`apps/api/src/repositories/SupabaseWorkoutRepository.ts`).
3. Update any affected route validation.
4. Flag it clearly in the PR description so mobile/web folks notice.

## Visual styling changes

Colors, typography, spacing, and icons live in `packages/design-tokens`
(`colors.ts`, `typography.ts`, `spacing.ts`, `icons.ts`, combined into a
single `theme` export). Both `apps/web` and `apps/mobile` import `theme` from
`@exercise-tracker/design-tokens` rather than hardcoding values. Icons are
plain Unicode/emoji glyphs (e.g. `theme.icons.profile`), not a vector icon
font — keep new icons in that same form so they stay dependency-free on both
platforms.

- Adding a new color/size/spacing/icon value? Add it to the relevant file
  under `packages/design-tokens/src/` and reference it via `theme.colors.*` /
  `theme.typography.*` / `theme.spacing.*` / `theme.icons.*` — don't inline a
  new literal in a component.
- Changing an existing value (e.g. rebranding a color)? Change it once in
  `packages/design-tokens` — every consumer picks it up automatically.
- Colors reflect real design decisions and should only change with explicit
  sign-off; typography/spacing should stay a small, reusable scale rather
  than one-off numbers per component.

## Content changes

Article content (title, author(s), an optional plain-text `lastUpdated`
line, an ordered body of paragraphs, subtitles, graphics, lists, and
callouts, plus optional numbered references) lives in `packages/content`
(`src/types.ts` for the model, one file per article, e.g. `src/landing.ts`,
combined via `src/index.ts`). Both `apps/web` and `apps/mobile` import the
same data — **author content once, here — don't hardcode copy or duplicate
it per app.**

**Rich text.** A `RichTextNode` is a flat run — `{ text, bold?, italic?,
underline?, href?, footnote?, break? }` — not a variant tag, so a single run
can be bold *and* italic *and* a link at once (a variant tag can't express
that without a combinatorial explosion of cases). `href` implies the run is
a link (rendered underlined); `footnote` marks the run as citing a numbered
entry in the article's `references` list (see "References/footnotes"
below); `break` inserts a soft line break right after the run (the
shift+enter of this model) for lines that share a paragraph's spacing but
still need to start a new line. Adding a new style (e.g. `strikethrough`)?
Add the optional flag to `RichTextNode` in `src/types.ts`, then handle it in
**both** platforms' `RichText.tsx`
(`apps/web/components/content/RichText.tsx`,
`apps/mobile/components/content/RichText.tsx`).

**Block types.** An article `body` is an ordered list of `Paragraph`,
`Subtitle` (identical to a `Paragraph` but rendered larger — e.g. a tagline
directly under the title), `Graphic`, `List` (a bulleted list of items, each
an ordered list of rich-text runs), `Callout` (same shape as `List` plus
an optional `heading`, but rendered on a rounded, tinted background — e.g.
an executive summary), and `Table` (plain-text `headers` plus `rows` of
rich-text cells, plus an optional `heading` — for reference/comparison data
the prose points back to instead of repeating inline) blocks. Adding a new
block type? Add the interface in
`src/types.ts`, add it to the `ArticleBodyBlock` union, then add a matching
case to **both** platforms' `ArticleView.tsx` — they switch exhaustively (a
`never` check), so a block type missed on one platform is a compile error,
not silently-dropped content.

**Last updated.** An `Article`'s optional `lastUpdated` is a plain authored
display string (e.g. `"August 3rd, 2026"`), not a parsed date or something
derived automatically (e.g. from git history) — update it by hand in the
same commit as any other content change to that article, the same way you'd
update the body copy itself.

**References/footnotes.** An `Article`'s optional `references: Reference[]`
(`{ id: number; url: string }`) lives at the article level rather than as a
body block, since footnotes are always rendered once, in order, at the end
of the article — there's no body position for an author to place them at.
Mark the citing text with `footnote: <id>` on its `RichTextNode` run, and add
the matching `{ id, url }` to `references`; both platforms' `ArticleView.tsx`
render a "References" list after the body when present.

**Assets.** Graphics are referenced by a logical `GraphicKey` only (a
string-literal union in `src/types.ts`) — this package never stores or knows
about a binary image or a URL. Each app:
1. Stores its own actual image file under `apps/<app>/assets/...` (e.g.
   `apps/web/assets/images/what-is-elexercise.svg`,
   `apps/mobile/assets/landing/what-is-elexercise.png`).
2. Maps every `GraphicKey` to that file in
   `apps/<app>/lib/content/graphicAssets.ts`, typed `Record<GraphicKey, ...>`
   — adding a key in the shared package without a matching entry on both
   platforms fails typecheck there.

A `Graphic` block may also carry an optional `caption?: RichTextNode[]` —
rendered under the image (e.g. a photo/diagram's attribution), which can
itself include a link.

Each platform is free to use a different file, format, or crop for the same
key — a wide landscape banner on web vs. a taller portrait crop on mobile,
an SVG on one platform vs. a raster photo on another — the shared package
has no opinion on this.

On web specifically: Next's built-in image loader treats a `.svg` import the
same as a raster import (the default export is an object
`{ src, width, height, ... }`, not a plain URL string), and `next/image`'s
Optimization API rejects SVGs unless `images.dangerouslyAllowSVG` is set in
`next.config.js`. Rather than adding that config, SVG graphics render via a
plain `<img src={asset.src}>` (`apps/web/components/content/FramedImage.tsx`),
not `next/image`.

- Editing existing copy? Change the relevant fields in the article's file
  under `packages/content/src/`.
- Adding a graphic? See "Assets" above.
- Adding a new article that should appear on the website's Articles listing?
  Add a new `packages/content/src/<name>.ts` file exporting an `Article`,
  re-export it from `packages/content/src/index.ts`, and add it to the
  `articles` array in `packages/content/src/articles.ts`. That's the whole
  checklist — `apps/web/app/resources/page.tsx`'s Articles table and
  `apps/web/app/resources/articles/[slug]/page.tsx` both read from that
  registry, so no new page file is needed. `landingArticle` (title "What is
  elexercise?") is a registry entry like any other, even though it's *also*
  rendered as an excerpt directly on the home page's hover popup — that
  dual use is expected, not a duplication to clean up.
- A purely decorative, page-layout image that's web-only and not yet
  confirmed for mobile may live directly in `apps/web` (imported straight
  into the page/component, clearly commented as web-only) instead of going
  through `packages/content`. This is a narrow, deliberate exception, not a
  default — if it's part of what the article actually says (copy, an
  illustrative diagram), it belongs in `packages/content` as a real
  `Graphic` block, same as `what-is-elexercise-diagram` in `landing.ts`.

## Equipment Analyzer (calculator) conventions

`apps/web/lib/calculator/` + `apps/web/components/calculator/` (the
`/resources/equipment-analyzer` page). A few non-obvious conventions if
you're touching this area:

- **Numeric fields can be emptied.** `NumberField`
  (`apps/web/components/calculator/formFields.tsx`) reads
  `e.target.valueAsNumber`, not `Number(e.target.value)` — the latter turns
  an emptied field into `0` instead of `NaN`, which used to force the field
  back to "0" the instant a user cleared it. Required-field validation
  happens once, at Save time (`apps/web/lib/calculator/validation.ts`), by
  checking `Number.isNaN(...)` / `!(value >= constraint)` — not per
  keystroke. Follow this pattern for any new numeric field rather than
  clamping/coercing on `onChange`.
- **CSV export mirrors the display definitions, but isn't the same data.**
  `apps/web/lib/calculator/csv.ts`'s `CSV_SETTINGS_ROWS`/`CSV_RESULT_ROWS`
  intentionally duplicate `EQUIPMENT_SETTINGS`/`RESULT_METRICS`' rows and
  ordering rather than reusing them directly, because the CSV wants raw
  numbers with a unit folded into the label (e.g. "Capital cost ($)") where
  the on-screen table wants a formatted display string (e.g. "$1,200").
  Keep both lists' row order in sync by hand when adding a new
  setting/metric.
- **`position: sticky` inside a CSS Grid item needs a non-grid-item
  wrapper.** A direct grid item that spans multiple columns (e.g.
  `CalculatorResultsTable.tsx`'s section-heading row) stretches to fill its
  entire grid area, which leaves `position: sticky` no room to shift — it
  silently behaves like `static`. Make the *sticky* element a content-sized
  child nested one level inside the (non-sticky, full-width) grid item
  instead, the way `SectionHeading`'s inner `<span>` does.
- **Equipment color is stored, not derived.** `CalculatorColumn.color`
  (`apps/web/lib/calculator/types.ts`) is a real, user-editable field set via
  the Equipment Editor's Color field (`ColorField` in
  `apps/web/components/calculator/formFields.tsx`) — it is *not* hashed from
  `id` the way real sport tags are
  (`packages/workout-history/src/activityColors.ts`). A brand-new draft's
  initial color comes from `defaultEquipmentColor()`
  (`apps/web/lib/calculator/colors.ts`), round-robining through
  `EQUIPMENT_COLOR_PALETTE` by `Calculator.tsx`'s `nextId.current` — not by
  hashing `id`, since an unsaved draft's `id` is `""` until Save. Don't
  reintroduce a hash-derived color for equipment, and don't reuse
  `activityColorForSport`/`sportTagColors` here — those back real sport tags
  elsewhere in the app (`SportTag.tsx`, `WorkoutHistoryRow.tsx`) and
  intentionally stay a separate, unrelated palette.
- **A `<label>` can only validly wrap one control.** `ColorField`
  (`apps/web/components/calculator/formFields.tsx`) renders as a `<div>`,
  not a `<label>` like every other field in this file, because it has six
  labelable children (five preset swatches + the native color input). A
  `<label>` wrapping several labelable elements implicitly associates with
  the *first* one, so any stray click landing in the label's box — e.g. a
  click just outside the native OS color picker, meant to dismiss it, that
  lands back on the field itself — gets forwarded to that first element,
  silently overwriting whatever was just picked. If a future field ever
  needs more than one control, don't default back to `<label>`.

## Mobile-specific instructions

Before writing any `apps/mobile` code, read `apps/mobile/AGENTS.md` (also
included by `apps/mobile/CLAUDE.md`) — it's a load-bearing warning that
Expo has changed enough that the pinned-version docs at
https://docs.expo.dev/versions/v57.0.0/ must be checked first.

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

There is currently no CI configured for this repo — these are the only
checks that run, so treat running them locally as mandatory, not a
pre-check.

`npm run lint` now runs for real across all three apps (`next lint` +
`eslint-config-next` for web, plain `eslint`/`typescript-eslint` for api,
`expo lint` + `eslint-config-expo` for mobile) — all three share one
`eslint@^8.57.0` install at the repo root rather than mixing majors, since
`apps/mobile`'s `expo lint` resolves `eslint` via a plain Node
`require()` from deep inside its own dependency tree and got confused
resolving a different major version hoisted elsewhere in this monorepo.
Note the root commands still run `--workspaces --if-present`, which
silently skips any workspace missing that script — `apps/mobile` has no
`test` script yet, so `npm run test` doesn't cover it.

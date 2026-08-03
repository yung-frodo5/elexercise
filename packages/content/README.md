# @exercise-tracker/content

Article content — title, author(s), paragraphs, and graphics — shared by
`apps/web` and `apps/mobile`. Plain TypeScript, no build step (same
convention as `packages/shared-types` and `packages/design-tokens`): each app
imports straight from `src/`, so there's nothing to compile or publish.

## Structure

```
src/
├── types.ts                  # Article / Author / Paragraph / RichTextNode / Graphic / List / Callout / Reference / GraphicKey
├── landing.ts                 # authored `landingArticle` data (the landing screen's content)
├── powerGenerationWorthIt.ts   # authored data for the first published Articles-tab entry
├── articles.ts                 # the `articles` registry + `getArticleBySlug` lookup
└── index.ts                   # combines the above into the package's public exports
```

Content is a small hierarchy: an `Article` has a `title`, `authors`, an
optional plain-text `lastUpdated` (e.g. `"August 3rd, 2026"`, rendered under
the byline), and a `body` — an ordered list of `Paragraph`, `Subtitle`,
`Graphic`, `List`, and `Callout` blocks, plus an optional `references` list.
A `Subtitle` is identical to a `Paragraph` (an ordered list of rich-text
runs) but renders larger — e.g. a tagline/definition directly under the
title — modeled as its own block type rather than special-casing "the first
paragraph" by array position, so it stays meaningful if body order changes.
A `List` is a bulleted list of items, each itself an ordered list of
rich-text runs (same shape as a `Paragraph`'s `content`), so a list item can
include a link or bold text like any other body copy. A `Callout` is the
same shape as a `List` (plus an optional `heading`) but renders on a
rounded, tinted background instead of inline with the rest of the body —
e.g. an executive summary — since that's a layout change (its own
padding/background), not just a text style, hence its own block type rather
than a flag on `List`.

A `Paragraph`/`Subtitle`/`List`/`Callout` item's content is an ordered list
of `RichTextNode` runs. Each run is a **flat object with style flags** —
`{ text, bold?, italic?, underline?, href?, footnote?, break? }` — rather
than a discriminated union of `"text"`/`"bold"`/`"link"` variants. A variant
tag can't express a run that's simultaneously bold *and* italic (or bold
*and* a link) without a combinatorial explosion of variants; flags compose
freely instead. `href` implies the run is a link (rendered underlined).
`footnote` marks the run as citing a numbered source — it renders as a small
superscript marker pointing at the `Reference` with the matching `id` in the
article's `references` list. `break` inserts a soft line break right after
the run — the shift+enter of this model, for lines that belong in the same
paragraph (no paragraph-spacing gap between them) but still need to start a
new line.

**References/footnotes.** An `Article`'s optional `references: Reference[]`
(`{ id: number; url: string }`) lives at the article level, not as a body
block — footnotes are always rendered once, in order, at the end of the
article, so there's no body position for an author to place them at. Both
platforms' `ArticleView.tsx` render a "References" section after the body
when `references` is present.

Graphics are referenced by a logical `GraphicKey` only — **never** a binary
image or a URL. This package has no opinion on what the image looks like,
what format it's in, or where the file lives; each app keeps its own actual
image file and maps the key to it in its own `lib/content/graphicAssets.ts`
(see "Usage" below). This also means each platform is free to use a
different file, format, or crop for the same logical key (e.g. a wide SVG
banner on web vs. a taller JPEG card on mobile). A `Graphic` may also carry
an optional `caption?: RichTextNode[]` — an attribution/credit line rendered
under the image (e.g. crediting a photo/diagram's source), which can itself
include a link.

**The `articles` registry.** `src/articles.ts` exports `articles: Article[]`
(every article that appears in the website's Articles listing) and
`getArticleBySlug(slug)` for looking one up. `apps/web`'s
`/resources/articles/[slug]` route renders whichever article this returns,
so publishing a new article never requires a new page file — see "Adding or
changing content" below. `landingArticle` is a normal entry in this
registry (rendered at `/resources/articles/what-is-elexercise`) that's
*also* rendered as an excerpt directly on the home page's hover popup —
that dual use is expected, not a duplication to clean up.

## Usage

```ts
// apps/web and apps/mobile
import { landingArticle } from "@exercise-tracker/content";
import type { Article, ArticleBodyBlock, RichTextNode } from "@exercise-tracker/content";
```

Each app also needs its own `lib/content/graphicAssets.ts` mapping every
`GraphicKey` to that platform's actual local image file, and its own
rendering components (`components/content/RichText.tsx`, `Graphic.tsx`,
`ArticleView.tsx`) that turn this data into platform-native elements — this
package only ever exports data and types, never rendering logic.

On web specifically: Next's built-in image loader treats a `.svg` import the
same as a raster import — the default export is a `StaticImageData`-shaped
object (`{ src, width, height, ... }`), not a plain URL string — and
`next/image`'s Optimization API rejects SVGs unless
`images.dangerouslyAllowSVG` is set in `next.config.js`. Rather than adding
that config, SVG graphics render via a plain `<img src={asset.src}>`
(`apps/web/components/content/FramedImage.tsx`), not `next/image`.

## Adding or changing content

See `CONTRIBUTING.md` at the repo root ("Content changes") for the full
checklist. Short version:
- Editing copy: change the relevant fields in `src/landing.ts` (or another
  per-article file).
- Adding a graphic: add the key to `GraphicKey` in `src/types.ts`, then add a
  matching image file + `Record` entry in **both**
  `apps/web/lib/content/graphicAssets.ts` and
  `apps/mobile/lib/content/graphicAssets.ts` — both fail to typecheck until
  you do.
- Adding a new rich-text style: add the optional flag to `RichTextNode` in
  `src/types.ts`, then update both platforms' `RichText` renderers (they use
  an exhaustive `never` check, so a missed case is a compile error, not a
  silent gap).
- Adding a new block type (like `Subtitle`/`List`/`Callout`): add the
  interface, add it to `ArticleBodyBlock`, then add a matching case to both
  platforms' `ArticleView.tsx` — same exhaustiveness guarantee.
- Adding a footnote: add `footnote: <n>` to the citing `RichTextNode` run(s)
  and a matching `{ id: <n>, url }` entry to the article's `references`
  array — numbers should read in the order they first appear in the body.
- Adding a new article that should appear in the website's Articles listing:
  add a new `src/<name>.ts` file exporting an `Article`, re-export it from
  `src/index.ts`, and add it to the `articles` array in `src/articles.ts`.
  `apps/web`'s `/resources/articles/[slug]` route and the `/resources` index
  table pick it up automatically — no new page file needed.

Keep authored content — copy, and any imagery that illustrates what an
article actually says — in this package, not hardcoded per app. The one
narrow exception in this codebase is a purely decorative, page-layout image
that's web-only and not yet confirmed for mobile (see the extra images
imported directly in `apps/web/app/page.tsx`, clearly commented as web-only)
— that's a deliberate, narrow carve-out, not a precedent for skipping this
package.

## Typecheck

```bash
npm run typecheck --workspace=packages/content
```

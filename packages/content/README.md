# @exercise-tracker/content

Article content — title, author(s), paragraphs, and graphics — shared by
`apps/web` and `apps/mobile`. Plain TypeScript, no build step (same
convention as `packages/shared-types` and `packages/design-tokens`): each app
imports straight from `src/`, so there's nothing to compile or publish.

## Structure

```
src/
├── types.ts     # Article / Author / Paragraph / RichTextNode / Graphic / GraphicKey
├── landing.ts   # authored `landingArticle` data (the landing screen's content)
└── index.ts     # combines the above into the package's public exports
```

Content is a small hierarchy: an `Article` has a `title`, `authors`, and a
`body` — an ordered list of `Paragraph`, `Subtitle`, and `Graphic` blocks.
A `Subtitle` is identical to a `Paragraph` (an ordered list of rich-text
runs) but renders larger — e.g. a tagline/definition directly under the
title — modeled as its own block type rather than special-casing "the first
paragraph" by array position, so it stays meaningful if body order changes.

A `Paragraph`/`Subtitle`'s `content` is an ordered list of `RichTextNode`
runs. Each run is a **flat object with style flags** —
`{ text, bold?, italic?, underline?, href? }` — rather than a discriminated
union of `"text"`/`"bold"`/`"link"` variants. A variant tag can't express a
run that's simultaneously bold *and* italic (or bold *and* a link) without a
combinatorial explosion of variants; flags compose freely instead. `href`
implies the run is a link (rendered underlined).

Graphics are referenced by a logical `GraphicKey` only — **never** a binary
image or a URL. This package has no opinion on what the image looks like,
what format it's in, or where the file lives; each app keeps its own actual
image file and maps the key to it in its own `lib/content/graphicAssets.ts`
(see "Usage" below). This also means each platform is free to use a
different file, format, or crop for the same logical key (e.g. a wide SVG
banner on web vs. a taller JPEG card on mobile).

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
- Adding a new block type (like `Subtitle`): add the interface, add it to
  `ArticleBodyBlock`, then add a matching case to both platforms'
  `ArticleView.tsx` — same exhaustiveness guarantee.
- Adding a new article: add a new `src/<name>.ts` file exporting an `Article`
  and re-export it from `src/index.ts`.

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

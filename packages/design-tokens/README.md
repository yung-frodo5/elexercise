# @exercise-tracker/design-tokens

Shared visual design tokens — colors, typography, spacing, and icons — for
`apps/web` and `apps/mobile`. Plain TypeScript, no build step (same
convention as `packages/shared-types`): each app imports straight from
`src/`, so there's nothing to compile or publish.

## Structure

```
src/
├── colors.ts       # brand palette, plus the themed/static color tiers (see below)
├── webTheme.ts     # web-only: derives CSS vars + the :root/dark <style> block from colors.ts
├── contrast.ts     # WCAG contrast-ratio helpers
├── typography.ts   # font family/size/weight scale
├── spacing.ts      # numeric spacing scale
├── icons.ts        # plain Unicode/emoji glyphs
└── index.ts        # combines the above into a single `theme` export
```

## Usage

Both apps import the same `theme` object and apply it with whatever styling
mechanism fits the platform:

```tsx
// apps/web — inline style props
import { theme } from "@exercise-tracker/design-tokens";
<p style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}>…</p>
```

```tsx
// apps/mobile — StyleSheet.create
import { theme } from "@exercise-tracker/design-tokens";
const styles = StyleSheet.create({
  label: { color: theme.colors.textMuted, fontSize: theme.typography.size.sm },
});
```

Icons work the same way — `theme.icons.profile` is just a string, rendered
with a `<span>` on web or `<Text>` on mobile. They're plain glyphs rather
than a vector icon font/component library on purpose: no new dependency, no
native linking, and identical behavior on both platforms.

### Light/dark mode on web: `theme.colors.themed.*` vs `theme.colors.static.*`

apps/web supports light and dark mode (apps/mobile doesn't yet). Every color
that touches the UI falls into one of two tiers, and picking the wrong one
is exactly how dark-mode contrast bugs happen (e.g. text rendering in a
color meant for a light background, on a background that's actually gone
dark) — so the tiers are separate namespaces, not a naming convention to
remember:

- **`theme.colors.themed.*`** — flips between light and dark automatically
  (backed by a CSS custom property declared in `webTheme.ts`'s
  `generateThemeCss()`, generated from the light/dark pairs in `colors.ts`'s
  `themedColors`). Use this for anything sitting on a surface that inverts
  in dark mode: the page canvas, the header/content-panel chrome, body and
  article text, links, error text, etc.
- **`theme.colors.static.*`** — always the same value, in both themes.
  Use this for anything sitting on a surface that's deliberately light in
  both themes (the history table, calculator panels, tooltips, the
  light-blue accent panels) — a light "card" floating on a dark page still
  needs its own text to stay dark, not flip to white.

**The rule: never pair a `themed.*` foreground with a `static.*` background,
or vice versa.** Before picking a color, look at what it's actually
rendered on top of. If you add a new themed color, also add its
light/dark-composited pairs to `contrast.test.ts` (see below) so a future
edit that breaks the contrast ratio fails a test instead of shipping.

The legacy flat keys directly on `theme.colors` (`navy`, `navyStatic`,
`error`, `secondaryGreen`, etc.) still exist for `apps/mobile`, which has no
dark mode and doesn't use `themed`/`static`. Don't add new web code against
those flat keys — use `themed`/`static` instead.

Need a translucent themed color (e.g. a border at partial opacity)? Don't
pass a `theme.colors.themed.*` value into `withAlpha()` — on web it's a CSS
`var()` string, which `withAlpha()` can't parse (it throws rather than
silently no-op'ing). Instead, bake the alpha directly into both sides of the
`themedColors` entry as `rgba(...)` strings (see `controlBorder` in
`colors.ts` for an example) — a CSS variable's value can be any valid CSS
color, so this works the same way as a plain hex pair.

## Contrast testing

`contrast.test.ts` asserts WCAG AA contrast ratios (4.5:1 for normal text,
3:1 for large text/UI components) for the actual foreground/background
combinations used in the app — not every possible pair, just the ones that
are really composited together. Run it with:

```bash
npm run test --workspace=packages/design-tokens
```

## Adding or changing tokens

See `CONTRIBUTING.md` at the repo root for the full policy. Short version:
add a new value to the relevant file here and reference it via `theme.*`
rather than inlining a literal in a component; colors are real design
decisions and need explicit sign-off, while typography/spacing/icons should
stay a small, reusable set rather than accumulating one-off values. Any new
entry in `themedColors` or `staticColors` should also get a corresponding
case in `contrast.test.ts` for every surface it's actually rendered on.

## Typecheck

```bash
npm run typecheck --workspace=packages/design-tokens
```

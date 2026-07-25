# @exercise-tracker/design-tokens

Shared visual design tokens — colors, typography, spacing, and icons — for
`apps/web` and `apps/mobile`. Plain TypeScript, no build step (same
convention as `packages/shared-types`): each app imports straight from
`src/`, so there's nothing to compile or publish.

## Structure

```
src/
├── colors.ts      # brand palette
├── typography.ts  # font family/size/weight scale
├── spacing.ts     # numeric spacing scale
├── icons.ts       # plain Unicode/emoji glyphs
└── index.ts       # combines the above into a single `theme` export
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

## Adding or changing tokens

See `CONTRIBUTING.md` at the repo root for the full policy. Short version:
add a new value to the relevant file here and reference it via `theme.*`
rather than inlining a literal in a component; colors are real design
decisions and need explicit sign-off, while typography/spacing/icons should
stay a small, reusable set rather than accumulating one-off values.

## Typecheck

```bash
npm run typecheck --workspace=packages/design-tokens
```

import { themedColors, type ThemedColor } from "./colors";

function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

// Web-only: derives a var()-wrapped string for each themedColors entry, the
// same mechanism `colors.navy` used on its own -- generalized so every
// themed token flips via `data-theme` with no per-component reactivity.
// Not imported by apps/mobile (React Native can't resolve var()).
export const webThemedColors: { [K in keyof typeof themedColors]: string } = Object.fromEntries(
  Object.entries(themedColors).map(([key, pair]) => [
    key,
    `var(--elex-${kebab(key)}, ${(pair as ThemedColor).light})`,
  ])
) as { [K in keyof typeof themedColors]: string };

// Single source of truth for the :root / html[data-theme="dark"] CSS block
// -- generated from the same themedColors object webThemedColors reads, so
// light/dark values are declared once instead of hand-duplicated between
// colors.ts and layout.tsx.
export function generateThemeCss(): string {
  const rootLines = Object.entries(themedColors).map(
    ([key, pair]) => `    --elex-${kebab(key)}: ${(pair as ThemedColor).light};`
  );
  const darkLines = Object.entries(themedColors).map(
    ([key, pair]) => `    --elex-${kebab(key)}: ${(pair as ThemedColor).dark};`
  );
  return `
  :root {
${rootLines.join("\n")}
  }
  html[data-theme="dark"] {
${darkLines.join("\n")}
  }
`;
}

// WCAG 2.x relative-luminance / contrast-ratio helpers -- see
// https://www.w3.org/TR/WCAG21/#contrast-minimum for the formula.

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseColor(color: string): Rgba {
  const rgbaMatch = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch;
    return { r: Number(r), g: Number(g), b: Number(b), a: a === undefined ? 1 : Number(a) };
  }
  const raw = color.replace("#", "");
  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16),
    a: 1,
  };
}

function srgbChannelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: Rgba): number {
  const [rl, gl, bl] = [r, g, b].map(srgbChannelToLinear);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** Alpha-composites `fg` over opaque `bg`, returning an opaque effective color. */
function compositeOver(fg: Rgba, bg: Rgba): Rgba {
  if (fg.a >= 1) return fg;
  return {
    r: fg.a * fg.r + (1 - fg.a) * bg.r,
    g: fg.a * fg.g + (1 - fg.a) * bg.g,
    b: fg.a * fg.b + (1 - fg.a) * bg.b,
    a: 1,
  };
}

/**
 * WCAG contrast ratio between a foreground and an opaque background, from 1
 * (no contrast) to 21. Accepts `#rrggbb` or `rgba()` strings -- a
 * translucent foreground (e.g. a semi-transparent border) is first
 * alpha-composited over `bg` so the ratio reflects what's actually visible,
 * not the foreground's own color in isolation.
 */
export function contrastRatio(fg: string, bg: string): number {
  const bgColor = parseColor(bg);
  const fgColor = compositeOver(parseColor(fg), bgColor);
  const l1 = relativeLuminance(fgColor);
  const l2 = relativeLuminance(bgColor);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

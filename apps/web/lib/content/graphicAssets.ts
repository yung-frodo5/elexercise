import type { StaticImageData } from "next/image";
import type { GraphicKey } from "@exercise-tracker/content";
// Next's built-in next-image-loader webpack rule handles .svg the same as
// raster formats — the import's default export is a StaticImageData object
// ({ src, width, height, ... }), not a plain URL string (the `any` type in
// node_modules/next/image-types/global.d.ts is just to avoid conflicting
// with tools like @svgr/webpack, not a sign the runtime value differs).
// Rendered via a plain <img src={....src}>, not next/image, since the
// built-in Image Optimization API rejects SVGs unless
// `images.dangerouslyAllowSVG` is explicitly enabled in next.config.js —
// not warranted just to render a local, trusted vector asset that doesn't
// need raster optimization anyway.
import landingHero from "../../assets/images/landing-hero.svg";

// Each app owns its own image files and maps the shared package's logical
// GraphicKey to them here — packages/content never sees the binary. Typing
// this as Record<GraphicKey, ...> means adding a key in the shared package
// without adding a matching entry here fails typecheck.
export const graphicAssets: Record<GraphicKey, StaticImageData> = {
  "landing-hero": landingHero,
};

import type { StaticImageData } from "next/image";
import type { GraphicKey } from "@exercise-tracker/content";
import type { Crop } from "../../components/content/FramedImage";
// Next's built-in next-image-loader webpack rule turns this import's default
// export into a StaticImageData object ({ src, width, height, ... }), not a
// plain URL string — hence the `.src` access at each call site.
import landingHero from "../../assets/images/landing-hero.png";

// Each app owns its own image files and maps the shared package's logical
// GraphicKey to them here — packages/content never sees the binary. Typing
// this as Record<GraphicKey, ...> means adding a key in the shared package
// without adding a matching entry here fails typecheck.
export const graphicAssets: Record<GraphicKey, StaticImageData> = {
  "landing-hero": landingHero,
};

// Optional per-asset crop (in the source image's native pixel space) for
// cases where a file bakes in blank margin that the border shouldn't hug.
// Keys not listed here render uncropped.
export const graphicCrops: Partial<Record<GraphicKey, Crop>> = {};

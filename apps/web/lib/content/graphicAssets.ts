import type { StaticImageData } from "next/image";
import type { GraphicKey } from "@exercise-tracker/content";
import type { Crop } from "../../components/content/FramedImage";
// Next's built-in next-image-loader webpack rule turns this import's default
// export into a StaticImageData object ({ src, width, height, ... }), not a
// plain URL string — hence the `.src` access at each call site.
import whatIsElexerciseDiagram from "../../assets/images/what-is-elexercise.svg";
import powerGenerationPixiiMachine from "../../assets/images/power-generation-pixii-machine.png";
import powerGenerationBikeCompNoCarbonPrice from "../../assets/images/power-generation-bike-comp-no-carbon-price.png";
import powerGenerationBikeCompCa from "../../assets/images/power-generation-bike-comp-ca.png";
import powerGenerationBikeCompHi from "../../assets/images/power-generation-bike-comp-hi.png";
import powerGenerationTreadmillComp from "../../assets/images/power-generation-treadmill-comp.png";

// Each app owns its own image files and maps the shared package's logical
// GraphicKey to them here — packages/content never sees the binary. Typing
// this as Record<GraphicKey, ...> means adding a key in the shared package
// without adding a matching entry here fails typecheck.
export const graphicAssets: Record<GraphicKey, StaticImageData> = {
  "what-is-elexercise-diagram": whatIsElexerciseDiagram,
  "power-generation-pixii-machine": powerGenerationPixiiMachine,
  "power-generation-bike-comp-no-carbon-price": powerGenerationBikeCompNoCarbonPrice,
  "power-generation-bike-comp-ca": powerGenerationBikeCompCa,
  "power-generation-bike-comp-hi": powerGenerationBikeCompHi,
  "power-generation-treadmill-comp": powerGenerationTreadmillComp,
};

// Optional per-asset crop (in the source image's native pixel space) for
// cases where a file bakes in blank margin that the border shouldn't hug.
// Keys not listed here render uncropped.
export const graphicCrops: Partial<Record<GraphicKey, Crop>> = {};

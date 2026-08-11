import type { StaticImageData } from "next/image";
import type { GraphicKey } from "@exercise-tracker/content";
import type { Crop } from "../../components/content/FramedImage";
// Next's built-in next-image-loader webpack rule turns this import's default
// export into a StaticImageData object ({ src, width, height, ... }), not a
// plain URL string — hence the `.src` access at each call site.
import whatIsElexerciseDiagram from "../../assets/images/what-is-elexercise.gif";
import powerGenerationPixiiMachine from "../../assets/images/power-generation-pixii-machine.png";
import powerGenerationBikeCompHomeUsage from "../../assets/images/power-generation-bike-comp-home-usage.svg";
import powerGenerationBikeCompNoCarbonPrice from "../../assets/images/power-generation-bike-comp-no-carbon-price.svg";
import powerGenerationBikeCompCa from "../../assets/images/power-generation-bike-comp-ca.svg";
import powerGenerationBikeCompHi from "../../assets/images/power-generation-bike-comp-hi.svg";
import powerGenerationTreadmillComp from "../../assets/images/power-generation-treadmill-comp.svg";
import howMuchPowerPreview from "../../assets/images/how-much-power-preview.png";
import lifeCycleStagesDiagram from "../../assets/images/life-cycle-stages-diagram.png";
import lifeCycleBaselineGwpChart from "../../assets/images/life-cycle-baseline-gwp-chart.png";
import lifeCyclePowerSensitivityChart from "../../assets/images/life-cycle-power-sensitivity-chart.png";
import lifeCycleCarbonIntensitySensitivityChart from "../../assets/images/life-cycle-carbon-intensity-sensitivity-chart.png";

// Each app owns its own image files and maps the shared package's logical
// GraphicKey to them here — packages/content never sees the binary. Typing
// this as Record<GraphicKey, ...> means adding a key in the shared package
// without adding a matching entry here fails typecheck.
export const graphicAssets: Record<GraphicKey, StaticImageData> = {
  "what-is-elexercise-diagram": whatIsElexerciseDiagram,
  "power-generation-pixii-machine": powerGenerationPixiiMachine,
  "power-generation-bike-comp-home-usage": powerGenerationBikeCompHomeUsage,
  "power-generation-bike-comp-no-carbon-price": powerGenerationBikeCompNoCarbonPrice,
  "power-generation-bike-comp-ca": powerGenerationBikeCompCa,
  "power-generation-bike-comp-hi": powerGenerationBikeCompHi,
  "power-generation-treadmill-comp": powerGenerationTreadmillComp,
  "how-much-power-preview": howMuchPowerPreview,
  "life-cycle-stages-diagram": lifeCycleStagesDiagram,
  "life-cycle-baseline-gwp-chart": lifeCycleBaselineGwpChart,
  "life-cycle-power-sensitivity-chart": lifeCyclePowerSensitivityChart,
  "life-cycle-carbon-intensity-sensitivity-chart": lifeCycleCarbonIntensitySensitivityChart,
};

// Optional per-asset crop (in the source image's native pixel space) for
// cases where a file bakes in blank margin that the border shouldn't hug.
// Keys not listed here render uncropped.
export const graphicCrops: Partial<Record<GraphicKey, Crop>> = {};

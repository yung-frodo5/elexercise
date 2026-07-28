import type { Graphic as GraphicBlock } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { graphicAssets } from "../../lib/content/graphicAssets";
import { FramedImage } from "./FramedImage";

// Fixed frame height — an aspect-locked full-bleed image gets absurdly tall
// on wide viewports (e.g. a 16:9 image at 1920px wide is 1080px tall).
export const HERO_HEIGHT = 416;

export function Graphic({ graphic }: { graphic: GraphicBlock }) {
  return (
    <div
      style={{
        width: "100%",
        height: HERO_HEIGHT,
        backgroundColor: theme.colors.background,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FramedImage src={graphicAssets[graphic.key].src} alt={graphic.alt} />
    </div>
  );
}

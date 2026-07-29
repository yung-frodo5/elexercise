import type { Graphic as GraphicBlock } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { graphicAssets, graphicCrops } from "../../lib/content/graphicAssets";
import { FramedImage } from "./FramedImage";

export function Graphic({ graphic, maxWidth }: { graphic: GraphicBlock; maxWidth?: number }) {
  const image = graphicAssets[graphic.key];
  const crop = graphicCrops[graphic.key];
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: theme.colors.background,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FramedImage image={image} alt={graphic.alt} maxWidth={maxWidth} crop={crop} />
    </div>
  );
}

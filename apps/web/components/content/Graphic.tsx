import type { Graphic as GraphicBlock } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { graphicAssets, graphicCrops } from "../../lib/content/graphicAssets";
import { FramedImage } from "./FramedImage";
import { RichText } from "./RichText";

export function Graphic({
  graphic,
  maxWidth,
  textColor = theme.colors.themed.navy,
}: {
  graphic: GraphicBlock;
  maxWidth?: number;
  textColor?: string;
}) {
  const image = graphicAssets[graphic.key];
  const crop = graphicCrops[graphic.key];
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FramedImage image={image} alt={graphic.alt} maxWidth={maxWidth} crop={crop} />
      {graphic.caption && (
        <p
          style={{
            marginTop: theme.spacing.xs,
            marginBottom: 0,
            fontSize: theme.typography.size.xxs,
            fontStyle: "italic",
            color: textColor,
            textAlign: "center",
          }}
        >
          <RichText nodes={graphic.caption} />
        </p>
      )}
    </div>
  );
}

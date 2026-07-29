import type { StaticImageData } from "next/image";
import { theme } from "@exercise-tracker/design-tokens";

// A crop rectangle in the source image's own native pixel space — used when
// an asset bakes in a blank margin around its real content, so the border
// can hug that content instead of the full canvas.
export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Scales fluidly to its container's width (up to maxWidth, defaulting to the
// image's own native resolution so it's never upscaled past its real size),
// with height derived from the (possibly cropped) intrinsic aspect ratio via
// the CSS aspect-ratio property — no fixed-height frame needed from a
// parent.
export function FramedImage({
  image,
  alt,
  maxWidth,
  crop,
}: {
  image: StaticImageData;
  alt: string;
  maxWidth?: number;
  crop?: Crop;
}) {
  if (!crop) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- SVG asset, rendered outside next/image's Optimization API (see graphicAssets.ts)
      <img
        src={image.src}
        alt={alt}
        style={{
          display: "block",
          width: "100%",
          maxWidth: maxWidth ?? image.width,
          height: "auto",
          // The box's aspect-ratio is already locked to the image's own
          // intrinsic ratio, so no object-fit is needed to reconcile them —
          // object-fit: contain would letterbox a hairline sliver of the
          // parent's background through on the sides whenever sub-pixel
          // rounding makes the two ratios not bit-for-bit identical.
          aspectRatio: `${image.width} / ${image.height}`,
          border: `2px solid ${theme.colors.border}`,
          boxSizing: "border-box",
        }}
      />
    );
  }

  // Render the full image at native scale (percentages relative to this
  // frame's own width/height, which are locked to the crop's aspect ratio),
  // then shift it up/left by the crop's offset so only the cropped region
  // is visible within this overflow-hidden frame. The border goes on the
  // frame rather than the <img> so it hugs the cropped content exactly.
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        maxWidth: maxWidth ?? crop.width,
        aspectRatio: `${crop.width} / ${crop.height}`,
        border: `2px solid ${theme.colors.border}`,
        boxSizing: "border-box",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset, rendered outside next/image's Optimization API (see graphicAssets.ts) */}
      <img
        src={image.src}
        alt={alt}
        style={{
          position: "absolute",
          display: "block",
          width: `${(image.width / crop.width) * 100}%`,
          height: `${(image.height / crop.height) * 100}%`,
          left: `${-(crop.x / crop.width) * 100}%`,
          top: `${-(crop.y / crop.height) * 100}%`,
          maxWidth: "none",
        }}
      />
    </div>
  );
}

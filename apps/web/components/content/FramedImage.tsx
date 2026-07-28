import { theme } from "@exercise-tracker/design-tokens";

// Sized to its own intrinsic aspect ratio (constrained by the flex parent's
// height/width), with the border applied directly to the <img> so it hugs
// the visible image rather than a full-bleed box with letterboxed padding.
export function FramedImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG asset, rendered outside next/image's Optimization API (see graphicAssets.ts)
    <img
      src={src}
      alt={alt}
      style={{
        display: "block",
        width: "auto",
        height: "auto",
        maxWidth: "100%",
        maxHeight: "100%",
        minWidth: 0,
        objectFit: "contain",
        border: `2px solid ${theme.colors.border}`,
        boxSizing: "border-box",
      }}
    />
  );
}

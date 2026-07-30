import { theme } from "@exercise-tracker/design-tokens";

export function AvatarCircle({ src, size }: { src: string; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: theme.radii.pill,
        overflow: "hidden",
        backgroundColor: theme.colors.border,
      }}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- user-provided image data, not a local asset next/image can optimize
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
    </div>
  );
}

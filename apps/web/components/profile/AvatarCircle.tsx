import { theme } from "@exercise-tracker/design-tokens";

// When badgeEmoji is set (the user has selected one of their earned badges
// as their avatar), it takes over the circle everywhere avatar_url
// normally renders -- src is ignored in that case.
export function AvatarCircle({
  src,
  size,
  badgeEmoji,
}: {
  src: string;
  size: number;
  badgeEmoji?: string | null;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: theme.radii.pill,
        overflow: "hidden",
        backgroundColor: theme.colors.border,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {badgeEmoji ? (
        <span aria-hidden style={{ fontSize: size * 0.65, lineHeight: 1 }}>
          {badgeEmoji}
        </span>
      ) : (
        src && (
          // eslint-disable-next-line @next/next/no-img-element -- user-provided image data, not a local asset next/image can optimize
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )
      )}
    </div>
  );
}

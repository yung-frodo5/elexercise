"use client";

import { theme } from "@exercise-tracker/design-tokens";

/** Simple magnifying-glass silhouette (not emoji). */
export function SearchIcon({
  size = 16,
  color = theme.colors.navy,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10.5" cy="10.5" r="6.25" stroke={color} strokeWidth="1.75" />
      <path
        d="M15.25 15.25L20 20"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

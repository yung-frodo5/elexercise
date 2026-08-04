"use client";

import { theme } from "@exercise-tracker/design-tokens";
import type { EarnedBadge } from "../../lib/useEarnedBadges";

// Clicking an already-selected badge deselects it (falls back to
// avatar_url) -- clicking any other earned badge selects that one instead.
export function EarnedBadges({
  badges,
  loading,
  selectedBadgeId,
  onSelect,
}: {
  badges: EarnedBadge[];
  loading: boolean;
  selectedBadgeId: string | null;
  onSelect: (badge: EarnedBadge | null) => void;
}) {
  if (loading) {
    return <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm }}>Loading badges…</p>;
  }

  if (badges.length === 0) {
    return (
      <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm }}>
        No badges earned yet — keep elexercising!
      </p>
    );
  }

  return (
    <div>
      {/* Same hover-popup pattern as LevelProgress.tsx's elexir tooltip --
          real <style> for :hover/:focus-within, which inline styles can't
          express. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .badge-tooltip-wrap { position: relative; }
        .badge-tooltip-popup {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 150ms ease;
          z-index: 10;
        }
        .badge-tooltip-wrap:hover .badge-tooltip-popup,
        .badge-tooltip-wrap:focus-within .badge-tooltip-popup {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
      `,
        }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.sm }}>
        {badges.map((badge) => {
          const isSelected = badge.id === selectedBadgeId;
          return (
            <div key={badge.id} className="badge-tooltip-wrap">
              <button
                type="button"
                onClick={() => onSelect(isSelected ? null : badge)}
                aria-pressed={isSelected}
                aria-label={`${badge.name}${isSelected ? " (selected as avatar)" : ""}`}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: theme.radii.pill,
                  border: isSelected ? `2px solid ${theme.colors.primaryGreen}` : "2px solid transparent",
                  background: "#D6E9FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: theme.typography.size.lg,
                  cursor: "pointer",
                }}
              >
                <span aria-hidden>{badge.emoji}</span>
              </button>
              <div
                className="badge-tooltip-popup"
                style={{
                  width: 200,
                  marginBottom: theme.spacing.xs,
                  backgroundColor: "#D6E9FF",
                  color: theme.colors.navyStatic,
                  fontSize: theme.typography.size.sm,
                  lineHeight: 1.4,
                  padding: theme.spacing.sm,
                  borderRadius: theme.radii.md,
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: theme.typography.weight.semibold }}>{badge.name}</div>
                {badge.tagline && <div style={{ fontStyle: "italic" }}>{badge.tagline}</div>}
                <div style={{ marginTop: 2 }}>{badge.criteria}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

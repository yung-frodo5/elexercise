"use client";

import { theme } from "@exercise-tracker/design-tokens";
import { progressToNextLevel } from "@exercise-tracker/leveling";
import { familjenGrotesk } from "../../lib/fonts";

// compact drops the elexir-earned/elexir-remaining captions and shrinks
// everything else -- for showing progress somewhere small (e.g. the header),
// not just the full Profile Details page. Same progressToNextLevel call
// either way, so the two never disagree about where the bar actually is.
export function LevelProgress({
  level,
  elexir,
  compact = false,
}: {
  level: number;
  elexir: number;
  compact?: boolean;
}) {
  const progress = progressToNextLevel(elexir);

  if (compact) {
    return (
      <div style={{ minWidth: 60, maxWidth: 160, width: "100%" }}>
        <div
          style={{
            fontSize: theme.typography.size.xxs,
            marginBottom: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Level {level}
          {progress.tier ? `: ${progress.tier.name}` : ""}
        </div>
        <div
          style={{
            width: "100%",
            height: 6,
            borderRadius: theme.radii.pill,
            backgroundColor: theme.colors.error,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress.progressFraction * 100}%`,
              height: "100%",
              borderRadius: theme.radii.pill,
              backgroundColor: theme.colors.primaryGreen,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Real <style> for :hover/:focus-within -- inline styles can't
          express pseudo-classes. Matches the same hover-popup pattern used
          for the home page's "elexercise" definition.
          dangerouslySetInnerHTML, not JSX text children -- a <style> tag's
          content is raw text per the HTML spec, so any quote/apostrophe
          added here later would get HTML-escaped by React's SSR but left
          un-decoded by the browser, desyncing server/client text and
          throwing a hydration error (see app/layout.tsx's fuller
          explanation of this). */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .elexir-tooltip-wrap { position: relative; display: inline-block; }
        .elexir-tooltip-popup {
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
        .elexir-tooltip-wrap:hover .elexir-tooltip-popup,
        .elexir-tooltip-wrap:focus-within .elexir-tooltip-popup {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
      `,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: theme.spacing.xs,
        }}
      >
        <span
          style={{
            fontSize: theme.typography.size.md,
            fontWeight: theme.typography.weight.semibold,
            fontFamily: familjenGrotesk.style.fontFamily,
          }}
        >
          Level {level}
          {progress.tier ? `: ${progress.tier.name}` : ""}
        </span>
        <span style={{ fontSize: theme.typography.size.sm, color: theme.colors.navy }}>
          {elexir}{" "}
          <span className="elexir-tooltip-wrap" tabIndex={0}>
            <span style={{ textDecoration: "underline dashed", cursor: "help" }}>elexir</span>
            <span
              className="elexir-tooltip-popup"
              style={{
                display: "block",
                width: 220,
                marginBottom: theme.spacing.xs,
                backgroundColor: theme.colors.static.accentPanelBg,
                // Static -- this popup's own light-blue background doesn't
                // invert in dark mode.
                color: theme.colors.static.ink,
                fontSize: theme.typography.size.sm,
                lineHeight: 1.4,
                padding: theme.spacing.sm,
                borderRadius: theme.radii.md,
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
                textAlign: "left",
              }}
            >
              Earn elexir by elexercising - earning elexir also unlocks badges and achievements!
            </span>
          </span>{" "}
          earned
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: 10,
          borderRadius: theme.radii.pill,
          backgroundColor: theme.colors.error,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress.progressFraction * 100}%`,
            height: "100%",
            borderRadius: theme.radii.pill,
            backgroundColor: theme.colors.primaryGreen,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {progress.tier && (
        <div style={{ marginTop: theme.spacing.xs, fontSize: theme.typography.size.sm, color: theme.colors.navy }}>
          {progress.tier.equivalent}
        </div>
      )}

      <div style={{ marginTop: theme.spacing.xs, fontSize: theme.typography.size.sm, color: theme.colors.navy }}>
        {progress.nextTier
          ? `${progress.xpRemaining} elexir to Level ${level + 1}: ${progress.nextTier.name}`
          : "Max level reached!"}
      </div>
    </div>
  );
}

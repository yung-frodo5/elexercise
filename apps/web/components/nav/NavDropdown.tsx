"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";

const KEYFRAMES_ID = "elex-nav-dropdown-keyframes";

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes elexNavMenuIn {
      from { opacity: 0; transform: translateY(-6px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);
}

const itemStyle: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
  borderRadius: 6,
  // Explicit, not inherited -- <a>/<button> don't reliably inherit color
  // from ancestors (the UA stylesheet's a:link/a:visited rules and a
  // button's own default text color both win over inheritance), so every
  // item needs its own color rather than relying on a parent's.
  color: theme.colors.textPrimary,
  fontSize: theme.typography.size.md,
  textDecoration: "none",
  background: "none",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "'Clash Display', sans-serif",
  lineHeight: 1.4,
  transition: "background-color 120ms ease, color 120ms ease",
  fontWeight: theme.typography.weight.medium,
};

const hoverBg = withAlpha(theme.colors.primaryGreen, 0.16);

// sageAccent (not primaryGreen) -- see colors.ts, it's the token meant for
// emphasized nav dropdown text and is the one of the three green tokens
// with enough contrast against this panel's navy background to pass WCAG
// AA at this text size. Applied to subsection links (e.g. "Profile" under
// "Social") to mark them, not their toggle-only parent label, as the
// items that actually navigate somewhere.
export const subsectionLinkStyle: CSSProperties = { color: theme.colors.sageAccent };

export function NavMenuItemLink({
  href,
  onClick,
  children,
  style,
}: {
  href: string;
  onClick: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...itemStyle,
        backgroundColor: hovered ? hoverBg : "transparent",
        ...style,
      }}
    >
      {children}
    </Link>
  );
}

export function NavMenuItemButton({
  onClick,
  children,
  style,
}: {
  onClick: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...itemStyle,
        backgroundColor: hovered ? hoverBg : "transparent",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** Floating panel for header nav / account menus. Site nav (not ARIA menu). */
export function NavDropdownPanel({
  open,
  align,
  id,
  children,
}: {
  open: boolean;
  align: "left" | "right";
  id: string;
  children: ReactNode;
}) {
  if (!open) return null;
  ensureKeyframes();

  // Both menus are small anchored dropdown cards under their trigger
  // button -- only the anchor edge (and how far they can grow) differs.
  const style: CSSProperties =
    align === "left"
      ? {
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: theme.spacing.sm,
          minWidth: 260,
          maxWidth: "85vw",
          maxHeight: "80vh",
          padding: theme.spacing.sm,
          overflowY: "auto",
          backgroundColor: "#002FA7",
          border: `1px solid ${withAlpha(theme.colors.border, 0.28)}`,
          borderRadius: theme.radii.xl,
          boxShadow: `0 10px 28px ${withAlpha(theme.colors.static.ink, 0.1)}`,
          zIndex: 150,
          animation: "elexNavMenuIn 160ms ease-out",
          transformOrigin: "top left",
        }
      : {
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: theme.spacing.sm,
          minWidth: 220,
          padding: theme.spacing.sm,
          overflow: "hidden",
          backgroundColor: "#002FA7",
          border: `1px solid ${withAlpha(theme.colors.border, 0.28)}`,
          borderRadius: theme.radii.xl,
          boxShadow: `0 10px 28px ${withAlpha(theme.colors.static.ink, 0.1)}`,
          zIndex: 2,
          animation: "elexNavMenuIn 160ms ease-out",
          transformOrigin: "top right",
        };

  return (
    <div id={id} style={style}>
      {children}
    </div>
  );
}

/**
 * Top-level nav row that only expands to reveal indented subsection
 * links -- neither the label nor the chevron navigate anywhere, both just
 * toggle the subsection list. Controlled (not internal state) so a parent
 * rendering several of these as an accordion can keep only one open at a
 * time.
 */
export function NavMenuExpandableItem({
  label,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const [chevronHovered, setChevronHovered] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <NavMenuItemButton onClick={onToggle} style={{ flex: 1 }}>
          {label}
        </NavMenuItemButton>
        <button
          type="button"
          aria-label={expanded ? `Collapse ${label}` : `Expand ${label}`}
          aria-expanded={expanded}
          onClick={onToggle}
          onMouseEnter={() => setChevronHovered(true)}
          onMouseLeave={() => setChevronHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            borderRadius: 6,
            border: "none",
            backgroundColor: chevronHovered ? hoverBg : "transparent",
            color: theme.colors.textPrimary,
            fontSize: theme.typography.size.sm,
            cursor: "pointer",
            transition: "background-color 120ms ease",
          }}
        >
          {/* One glyph rotated (rather than swapping expand/collapse
              glyphs) so the chevron itself smoothly animates instead of
              snapping between two different shapes. */}
          <span
            aria-hidden
            style={{
              display: "inline-block",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 200ms ease",
            }}
          >
            {theme.icons.expand}
          </span>
        </button>
      </div>
      {/* Always mounted (not conditionally rendered) so the height change
          can transition -- an unmounted subtree can't animate its own
          removal. grid-template-rows 0fr/1fr is the standard way to
          transition to/from "auto" height without measuring the content in
          JS; the inner overflow:hidden clips it mid-transition. */}
      <div
        aria-hidden={!expanded}
        style={{
          display: "grid",
          gridTemplateRows: expanded ? "1fr" : "0fr",
          transition: "grid-template-rows 220ms ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div style={{ paddingLeft: theme.spacing.md }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

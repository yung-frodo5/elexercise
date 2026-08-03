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
    @keyframes elexNavDrawerIn {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
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

export const navSectionLabelStyle: CSSProperties = {
  margin: 0,
  padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
  fontSize: theme.typography.size.md,
  // Clash Display is capped at Semibold everywhere except the header
  // wordmark ("elexercise!").
  fontWeight: theme.typography.weight.semibold,
  fontFamily: "'Clash Display', sans-serif",
  color: "#228B22",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

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

  // The left (main nav) menu is a full-height drawer fixed to the left edge
  // of the window, not a small anchored dropdown like the right (profile)
  // menu -- per design feedback, distinct enough from the right menu's
  // layout that it needs its own branch rather than a shared style object.
  const style: CSSProperties =
    align === "left"
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 400,
          maxWidth: "85vw",
          padding: theme.spacing.sm,
          overflowY: "auto",
          backgroundColor: "#002FA7",
          borderRight: `1px solid ${withAlpha(theme.colors.border, 0.28)}`,
          boxShadow: `0 10px 28px ${withAlpha(theme.colors.navyStatic, 0.1)}`,
          zIndex: 150,
          animation: "elexNavDrawerIn 180ms ease-out",
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
          borderRadius: theme.radii.pill,
          boxShadow: `0 10px 28px ${withAlpha(theme.colors.navyStatic, 0.1)}`,
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

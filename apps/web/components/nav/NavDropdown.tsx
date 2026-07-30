"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { theme } from "@exercise-tracker/design-tokens";
import { withAlpha } from "../../lib/color";

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
  color: theme.colors.textPrimary,
  fontSize: theme.typography.size.md,
  textDecoration: "none",
  background: "none",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "inherit",
  lineHeight: 1.35,
  transition: "background-color 120ms ease, color 120ms ease",
  fontWeight: theme.typography.weight.medium,
};

const hoverBg = withAlpha(theme.colors.primaryGreen, 0.16);

export const navSectionLabelStyle: CSSProperties = {
  margin: 0,
  padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
  fontSize: theme.typography.size.xs,
  fontWeight: theme.typography.weight.semibold,
  color: theme.colors.textMuted,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

export function NavMenuItemLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: ReactNode;
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
      }}
    >
      {children}
    </Link>
  );
}

export function NavMenuItemButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
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

  return (
    <div
      id={id}
      style={{
        position: "absolute",
        top: "100%",
        ...(align === "left" ? { left: 0 } : { right: 0 }),
        marginTop: theme.spacing.sm,
        minWidth: 220,
        padding: theme.spacing.sm,
        overflow: "hidden",
        backgroundColor: theme.colors.background,
        border: `1px solid ${withAlpha(theme.colors.border, 0.28)}`,
        borderRadius: 10,
        boxShadow: `0 10px 28px ${withAlpha(theme.colors.textPrimary, 0.1)}`,
        zIndex: 2,
        animation: "elexNavMenuIn 160ms ease-out",
        transformOrigin: align === "left" ? "top left" : "top right",
      }}
    >
      {children}
    </div>
  );
}

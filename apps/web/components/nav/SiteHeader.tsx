"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { theme } from "@exercise-tracker/design-tokens";
import { supabase } from "../../lib/supabase";
import { useSupabaseSession } from "../../lib/useSession";
import { useProfile } from "../../lib/useProfile";
import { LoginModal } from "../auth/LoginModal";
import logo from "../../assets/images/logo.png";
import { HEADER_HEIGHT } from "../../lib/layoutConstants";

const menuItemStyle: CSSProperties = {
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
};

const menuSectionLabelStyle: CSSProperties = {
  margin: 0,
  padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
  fontSize: theme.typography.size.xs,
  fontWeight: theme.typography.weight.semibold,
  color: theme.colors.textMuted,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

function MenuItemLink({
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
        ...menuItemStyle,
        backgroundColor: hovered ? "rgba(106, 153, 78, 0.16)" : "transparent",
        fontWeight: theme.typography.weight.medium,
      }}
    >
      {children}
    </Link>
  );
}

function MenuItemButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...menuItemStyle,
        backgroundColor: hovered ? "rgba(106, 153, 78, 0.16)" : "transparent",
        fontWeight: theme.typography.weight.medium,
      }}
    >
      {children}
    </button>
  );
}

function useDismissOnOutsideOrEscape(
  open: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const node = containerRef.current;
      if (node && !node.contains(event.target as Node)) onClose();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, containerRef]);
}

function DropdownPanel({
  open,
  align,
  labelledBy,
  children,
}: {
  open: boolean;
  align: "left" | "right";
  labelledBy: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      role="menu"
      aria-labelledby={labelledBy}
      style={{
        position: "absolute",
        top: "100%",
        ...(align === "left" ? { left: 0 } : { right: 0 }),
        marginTop: theme.spacing.sm,
        minWidth: 220,
        padding: theme.spacing.sm,
        overflow: "hidden",
        backgroundColor: theme.colors.background,
        border: "1px solid rgba(91, 70, 43, 0.28)",
        borderRadius: 10,
        boxShadow: "0 10px 28px rgba(17, 29, 19, 0.1)",
        zIndex: 2,
        animation: "elexNavMenuIn 160ms ease-out",
        transformOrigin: align === "left" ? "top left" : "top right",
      }}
    >
      {children}
    </div>
  );
}

export function SiteHeader() {
  const { session, loading } = useSupabaseSession();
  const { displayName } = useProfile(session?.user.id);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navMenuButtonId = useId();
  const profileMenuButtonId = useId();

  useDismissOnOutsideOrEscape(menuOpen, () => setMenuOpen(false), navMenuRef);
  useDismissOnOutsideOrEscape(profileMenuOpen, () => setProfileMenuOpen(false), profileMenuRef);

  async function handleSignOut() {
    setProfileMenuOpen(false);
    await supabase.auth.signOut();
    router.replace("/");
  }

  function toggleNavMenu() {
    setProfileMenuOpen(false);
    setMenuOpen((open) => !open);
  }

  function toggleProfileMenu() {
    setMenuOpen(false);
    setProfileMenuOpen((open) => !open);
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: HEADER_HEIGHT,
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        paddingLeft: theme.spacing.lg,
        paddingRight: theme.spacing.lg,
        backgroundColor: theme.colors.bannerBackground,
      }}
    >
      <style>{`
        @keyframes elexNavMenuIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div ref={navMenuRef} style={{ position: "relative", justifySelf: "start" }}>
        <button
          id={navMenuButtonId}
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={toggleNavMenu}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 8,
            background: menuOpen ? "rgba(17, 29, 19, 0.08)" : "transparent",
            border: "none",
            cursor: "pointer",
            color: theme.colors.textPrimary,
            fontSize: theme.typography.size.lg,
            transition: "background-color 120ms ease",
          }}
        >
          <span aria-hidden>{menuOpen ? theme.icons.close : theme.icons.menu}</span>
        </button>

        <DropdownPanel open={menuOpen} align="left" labelledBy={navMenuButtonId}>
          <MenuItemLink href="/" onClick={() => setMenuOpen(false)}>
            Home
          </MenuItemLink>

          {session && (
            <>
              <div style={{ height: theme.spacing.xs }} />
              <p style={menuSectionLabelStyle}>Exercise Dashboard</p>
              <MenuItemLink href="/track" onClick={() => setMenuOpen(false)}>
                Current Workout
              </MenuItemLink>
              <MenuItemLink href="/history" onClick={() => setMenuOpen(false)}>
                Workout Log
              </MenuItemLink>
            </>
          )}

          <div style={{ height: theme.spacing.xs }} />
          <p style={menuSectionLabelStyle}>Resources</p>
          <MenuItemLink href="/resources" onClick={() => setMenuOpen(false)}>
            Overview
          </MenuItemLink>
          <MenuItemLink href="/resources/calculator" onClick={() => setMenuOpen(false)}>
            Calculator
          </MenuItemLink>
        </DropdownPanel>
      </div>

      <Link
        href="/"
        style={{
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.xs,
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.fontFamily.mono,
          fontSize: theme.typography.size.lg,
          textDecoration: "none",
          justifySelf: "center",
        }}
      >
        <img src={logo.src} alt="" width={44} height={44} />
        elexercise!
      </Link>

      <div ref={profileMenuRef} style={{ position: "relative", justifySelf: "end" }}>
        {!loading && (
          <>
            {session ? (
              <>
                <button
                  id={profileMenuButtonId}
                  type="button"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                  onClick={toggleProfileMenu}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.xs,
                    maxWidth: 220,
                    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
                    borderRadius: 8,
                    background: profileMenuOpen ? "rgba(17, 29, 19, 0.08)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.size.md,
                    transition: "background-color 120ms ease",
                  }}
                >
                  <span aria-hidden>{theme.icons.profile}</span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayName ?? session.user.email}
                  </span>
                </button>

                <DropdownPanel open={profileMenuOpen} align="right" labelledBy={profileMenuButtonId}>
                  <MenuItemLink href="/profile" onClick={() => setProfileMenuOpen(false)}>
                    Profile
                  </MenuItemLink>
                  <MenuItemButton onClick={() => void handleSignOut()}>Sign out</MenuItemButton>
                </DropdownPanel>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.xs,
                  padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
                  borderRadius: 8,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.size.md,
                }}
              >
                <span aria-hidden>{theme.icons.login}</span>
                <span>Log in</span>
              </button>
            )}
          </>
        )}
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}

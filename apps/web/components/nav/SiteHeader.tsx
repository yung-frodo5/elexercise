"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { theme } from "@exercise-tracker/design-tokens";
import { supabase } from "../../lib/supabase";
import { isDevBypassAuth } from "../../lib/devAuth";
import { useSupabaseSession } from "../../lib/useSession";
import { useProfile } from "../../lib/useProfile";
import { LoginModal } from "../auth/LoginModal";
import logo from "../../assets/images/logo.png";
import { HEADER_HEIGHT } from "../../lib/layoutConstants";
import { withAlpha } from "../../lib/color";
import {
  NavDropdownPanel,
  NavMenuItemButton,
  NavMenuItemLink,
  navSectionLabelStyle,
} from "./NavDropdown";
import { useDismissOnOutsideOrEscape } from "./useDismissOnOutsideOrEscape";

const pressedBg = withAlpha(theme.colors.textPrimary, 0.08);

export function SiteHeader() {
  const bypass = isDevBypassAuth();
  const { session, loading } = useSupabaseSession();
  const { displayName } = useProfile(session?.user.id);
  const showAppNav = Boolean(session) || bypass;
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navMenuButtonId = useId();
  const profileMenuButtonId = useId();
  const navPanelId = useId();
  const profilePanelId = useId();

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
      <div ref={navMenuRef} style={{ position: "relative", justifySelf: "start" }}>
        <button
          id={navMenuButtonId}
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls={navPanelId}
          onClick={toggleNavMenu}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 8,
            background: menuOpen ? pressedBg : "transparent",
            border: "none",
            cursor: "pointer",
            color: theme.colors.textPrimary,
            fontSize: theme.typography.size.lg,
            transition: "background-color 120ms ease",
          }}
        >
          <span aria-hidden>{menuOpen ? theme.icons.close : theme.icons.menu}</span>
        </button>

        <NavDropdownPanel open={menuOpen} align="left" id={navPanelId}>
          <NavMenuItemLink href="/" onClick={() => setMenuOpen(false)}>
            Home
          </NavMenuItemLink>

          {showAppNav && (
            <>
              <div style={{ height: theme.spacing.xs }} />
              <p style={navSectionLabelStyle}>Exercise Dashboard</p>
              <NavMenuItemLink href="/track" onClick={() => setMenuOpen(false)}>
                Current Workout
              </NavMenuItemLink>
              <NavMenuItemLink href="/history" onClick={() => setMenuOpen(false)}>
                Workout Log
              </NavMenuItemLink>
            </>
          )}

          <div style={{ height: theme.spacing.xs }} />
          <p style={navSectionLabelStyle}>Resources</p>
          <NavMenuItemLink href="/resources" onClick={() => setMenuOpen(false)}>
            Overview
          </NavMenuItemLink>
          <NavMenuItemLink href="/resources/calculator" onClick={() => setMenuOpen(false)}>
            Calculator
          </NavMenuItemLink>
        </NavDropdownPanel>
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
                  aria-expanded={profileMenuOpen}
                  aria-controls={profilePanelId}
                  onClick={toggleProfileMenu}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.xs,
                    maxWidth: 220,
                    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
                    borderRadius: 8,
                    background: profileMenuOpen ? pressedBg : "transparent",
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

                <NavDropdownPanel open={profileMenuOpen} align="right" id={profilePanelId}>
                  <NavMenuItemLink href="/profile" onClick={() => setProfileMenuOpen(false)}>
                    Profile
                  </NavMenuItemLink>
                  <NavMenuItemButton onClick={() => void handleSignOut()}>Sign out</NavMenuItemButton>
                </NavDropdownPanel>
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

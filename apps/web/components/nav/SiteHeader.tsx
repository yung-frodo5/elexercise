"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import { supabase } from "../../lib/supabase";
import { useSupabaseSession } from "../../lib/useSession";
import { useProfile } from "../../lib/useProfile";
import { LoginModal } from "../auth/LoginModal";
import { LevelProgress } from "../profile/LevelProgress";
import { AvatarCircle } from "../profile/AvatarCircle";
import logo from "../../assets/images/logo.png";
import { HEADER_HEIGHT } from "../../lib/layoutConstants";
import {
  NavDropdownPanel,
  NavMenuItemButton,
  NavMenuItemLink,
  navSectionLabelStyle,
} from "./NavDropdown";
import { useDismissOnOutsideOrEscape } from "./useDismissOnOutsideOrEscape";

const pressedBg = withAlpha(theme.colors.navy, 0.08);

export function SiteHeader() {
  const { session, loading } = useSupabaseSession();
  const { displayName, level, elexir, avatarUrl } = useProfile(session?.user.id);
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
    <>
      {/* Real <style> for the media query -- inline styles can't express
          one. Below ~360px there isn't room for the logo, "elexercise!",
          and the profile button all on one row without something giving;
          the wordmark text is the least essential of the three. */}
      <style>{`
        @media (max-width: 360px) {
          .site-header-wordmark-text { display: none; }
        }
      `}</style>
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
        backgroundColor: "#FFFFFF",
      }}
    >
      <div ref={navMenuRef} style={{ position: "relative", justifySelf: "start", minWidth: 0 }}>
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
            color: "#228B22",
            fontSize: theme.typography.size.lg,
            transition: "background-color 120ms ease",
          }}
        >
          <span aria-hidden>{menuOpen ? theme.icons.close : theme.icons.menu}</span>
        </button>

        <NavDropdownPanel open={menuOpen} align="left" id={navPanelId}>
          <NavMenuItemLink
            href="/"
            onClick={() => setMenuOpen(false)}
            style={{
              fontWeight: navSectionLabelStyle.fontWeight,
              fontSize: navSectionLabelStyle.fontSize,
              letterSpacing: navSectionLabelStyle.letterSpacing,
              textTransform: navSectionLabelStyle.textTransform,
              color: theme.colors.error,
            }}
          >
            Home
          </NavMenuItemLink>

          {session && (
            <>
              <div style={{ height: theme.spacing.xs }} />
              <p style={navSectionLabelStyle}>Exercise Dashboard</p>
              <NavMenuItemLink href="/track" onClick={() => setMenuOpen(false)}>
                Current Workout
              </NavMenuItemLink>
              <NavMenuItemLink href="/history" onClick={() => setMenuOpen(false)}>
                Workout Log
              </NavMenuItemLink>
              <NavMenuItemLink href="/leaderboard" onClick={() => setMenuOpen(false)}>
                Leaderboard
              </NavMenuItemLink>
            </>
          )}

          <div style={{ height: theme.spacing.xs }} />
          <p style={navSectionLabelStyle}>Resources</p>
          <NavMenuItemLink href="/resources/calculator" onClick={() => setMenuOpen(false)}>
            Calculator
          </NavMenuItemLink>
          <NavMenuItemLink href="/resources" onClick={() => setMenuOpen(false)}>
            Other Resources
          </NavMenuItemLink>
          <NavMenuItemLink
            href="/resources/about"
            onClick={() => setMenuOpen(false)}
            style={{
              fontWeight: navSectionLabelStyle.fontWeight,
              fontSize: navSectionLabelStyle.fontSize,
              color: navSectionLabelStyle.color,
              letterSpacing: navSectionLabelStyle.letterSpacing,
              textTransform: navSectionLabelStyle.textTransform,
            }}
          >
            About
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
          color: "#228B22",
          fontSize: theme.typography.size.lg,
          fontWeight: theme.typography.weight.bold,
          textDecoration: "none",
          justifySelf: "center",
        }}
      >
        <img src={logo.src} alt="" width={44} height={44} />
        <span className="site-header-wordmark-text">elexercise!</span>
      </Link>

      <div ref={profileMenuRef} style={{ position: "relative", justifySelf: "end", minWidth: 0 }}>
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
                    minWidth: 0,
                    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
                    borderRadius: 8,
                    background: profileMenuOpen ? pressedBg : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#228B22",
                    fontSize: theme.typography.size.md,
                    transition: "background-color 120ms ease",
                  }}
                >
                  <AvatarCircle src={avatarUrl ?? ""} size={28} />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: theme.typography.weight.bold,
                      minWidth: 0,
                    }}
                  >
                    {displayName ?? session.user.email}
                  </span>
                </button>

                {level !== null && elexir !== null && (
                  <div style={{ padding: `0 ${theme.spacing.sm}px`, color: theme.colors.navy }}>
                    <LevelProgress level={level} elexir={elexir} compact />
                  </div>
                )}

                <NavDropdownPanel open={profileMenuOpen} align="right" id={profilePanelId}>
                  <NavMenuItemLink href="/profile" onClick={() => setProfileMenuOpen(false)}>
                    Profile
                  </NavMenuItemLink>
                  <NavMenuItemButton onClick={() => void handleSignOut()} style={{ color: theme.colors.error }}>
                    Sign out
                  </NavMenuItemButton>
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
                  color: theme.colors.navy,
                  fontSize: theme.typography.size.md,
                }}
              >
                <span>Log in</span>
              </button>
            )}
          </>
        )}
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </header>
    </>
  );
}

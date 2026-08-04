"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
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
import { FOOTER_HEIGHT } from "./SiteFooter";
import {
  NavDropdownPanel,
  NavMenuItemButton,
  NavMenuItemLink,
  navSectionLabelStyle,
} from "./NavDropdown";
import { useDismissOnOutsideOrEscape } from "./useDismissOnOutsideOrEscape";
import { ThemeToggle } from "./ThemeToggle";
import { newsreader } from "../../lib/fonts";

const pressedBg = withAlpha(theme.colors.navyStatic, 0.08);

export function SiteHeader() {
  const { session, loading } = useSupabaseSession();
  const { displayName, level, elexir, avatarUrl, badgeEmoji } = useProfile(session?.user.id);
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
          the wordmark text is the least essential of the three.
          dangerouslySetInnerHTML, not JSX text children -- the quotes in
          the data-theme selector below get HTML-escaped by React's SSR but
          left un-decoded by the browser inside <style> (a raw-text
          element), desyncing server/client text and throwing a hydration
          error (see app/layout.tsx's fuller explanation of this). */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 360px) {
          .site-header-wordmark-text { display: none; }
        }
        @media (max-width: 600px) {
          .site-header-display-name { display: none; }
          .site-header-level { display: none; }
        }
        /* Dark mode: only the white portion of the header's gradient
           inverts -- the #002FA7 strip stays #002FA7, matching the
           vertical ribbon below it, which also doesn't change in dark mode. */
        html[data-theme="dark"] .site-header {
          background: linear-gradient(to right, #002FA7 ${FOOTER_HEIGHT}px, #001F3F ${FOOTER_HEIGHT}px) !important;
        }
      `,
        }}
      />
      <header
        className="site-header"
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
        // Solid #002FA7 for the leftmost FOOTER_HEIGHT px (same width as
        // the vertical ribbon below the header, so the two read as one
        // continuous band up to the top of the page), white everywhere
        // else -- a hard-edged gradient rather than touching the ribbon's
        // own z-index/stacking, which would risk covering (and making
        // unclickable) the hamburger button living in that header column.
        background: `linear-gradient(to right, #002FA7 ${FOOTER_HEIGHT}px, #FFFFFF ${FOOTER_HEIGHT}px)`,
      }}
    >
      {/* Absolutely positioned (relative to the fixed <header>) and sized
          to exactly the blue strip's width, rather than left in the grid's
          first column with the header's own paddingLeft -- that combo put
          the button off-center in the strip (flush with its right edge,
          not centered). */}
      <div
        ref={navMenuRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: FOOTER_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
              fontFamily: navSectionLabelStyle.fontFamily,
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
          <NavMenuItemLink href="/resources/equipment-analyzer" onClick={() => setMenuOpen(false)}>
            Equipment Analyzer
          </NavMenuItemLink>
          <NavMenuItemLink href="/resources" onClick={() => setMenuOpen(false)}>
            All Resources
          </NavMenuItemLink>
          <NavMenuItemLink
            href="/resources/articles/what-is-elexercise"
            onClick={() => setMenuOpen(false)}
            style={{
              fontWeight: navSectionLabelStyle.fontWeight,
              fontSize: navSectionLabelStyle.fontSize,
              fontFamily: navSectionLabelStyle.fontFamily,
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
          fontFamily: "'Clash Display', sans-serif",
          textDecoration: "none",
          // The hamburger's wrapper is position:absolute now (see above),
          // which takes it out of grid auto-placement entirely -- without
          // an explicit column, this and the profile section below would
          // both shift left into columns 1/2 instead of 2/3.
          gridColumn: 2,
          justifySelf: "center",
        }}
      >
        <Image src={logo} alt="" width={44} height={44} />
        <span className="site-header-wordmark-text">elexercise!</span>
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.xs,
          gridColumn: 3,
          justifySelf: "end",
          minWidth: 0,
        }}
      >
        <ThemeToggle />
        <div ref={profileMenuRef} style={{ position: "relative", minWidth: 0 }}>
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
                  <AvatarCircle src={avatarUrl ?? ""} size={28} badgeEmoji={badgeEmoji} />
                  <span
                    className="site-header-display-name"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: theme.typography.weight.semibold,
                      fontFamily: "'Clash Display', sans-serif",
                      minWidth: 0,
                    }}
                  >
                    {displayName ?? session.user.email}
                  </span>
                </button>

                {level !== null && elexir !== null && (
                  <div
                    className="site-header-level"
                    style={{
                      padding: `0 ${theme.spacing.sm}px`,
                      color: theme.colors.navy,
                      fontFamily: newsreader.style.fontFamily,
                    }}
                  >
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
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </header>
    </>
  );
}

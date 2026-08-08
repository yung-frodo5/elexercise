"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import { supabase } from "../../lib/supabase";
import { useSupabaseSession } from "../../lib/useSession";
import { useProfile } from "../../lib/useProfile";
import { AccessCodeModal } from "../auth/AccessCodeModal";
import { LoginModal } from "../auth/LoginModal";
import { LevelProgress } from "../profile/LevelProgress";
import { AvatarCircle } from "../profile/AvatarCircle";
import logo from "../../assets/images/logo.png";
import { HEADER_HEIGHT } from "../../lib/layoutConstants";
import {
  NavDropdownPanel,
  NavMenuExpandableItem,
  NavMenuItemButton,
  NavMenuItemLink,
  subsectionLinkStyle,
} from "./NavDropdown";
import { useDismissOnOutsideOrEscape } from "./useDismissOnOutsideOrEscape";
import { ThemeToggle } from "./ThemeToggle";
import { familjenGrotesk } from "../../lib/fonts";

const pressedBg = withAlpha(theme.colors.static.ink, 0.08);

export function SiteHeader() {
  const { session, loading } = useSupabaseSession();
  const { displayName, level, elexir, avatarUrl, badgeEmoji } = useProfile(session?.user.id);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [accessCodeOpen, setAccessCodeOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  // Accordion -- at most one of the three expandable sections open at once.
  const [expandedSection, setExpandedSection] = useState<"social" | "exercise" | "resources" | null>(null);

  const navMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navMenuButtonId = useId();
  const profileMenuButtonId = useId();
  const navPanelId = useId();
  const profilePanelId = useId();

  useDismissOnOutsideOrEscape(menuOpen, () => setMenuOpen(false), navMenuRef);
  useDismissOnOutsideOrEscape(profileMenuOpen, () => setProfileMenuOpen(false), profileMenuRef);

  // The menu itself unmounts on close (NavDropdownPanel renders nothing
  // when closed), so reopening it always starts collapsed -- reset here
  // too, so expandedSection (lifted out to enforce the accordion) matches
  // that same expectation instead of silently remembering the last section
  // across a close/reopen.
  useEffect(() => {
    if (!menuOpen) setExpandedSection(null);
  }, [menuOpen]);

  function toggleSection(section: "social" | "exercise" | "resources") {
    setExpandedSection((current) => (current === section ? null : section));
  }

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
        backgroundColor: theme.colors.themed.chromeBg,
      }}
    >
      {/* position: relative, not the header's own fixed positioning --
          the header is already position:fixed, so this button and its
          dropdown float "for free" without needing their own fixed
          overlay, and the wordmark stays centered via the header's own
          1fr/auto/1fr grid without extra compensation. */}
      <div ref={navMenuRef} style={{ position: "relative", gridColumn: 1, justifySelf: "start" }}>
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
            width: 44,
            height: 44,
            borderRadius: theme.radii.pill,
            backgroundColor: theme.colors.themed.controlOnChrome,
            boxShadow: `0 4px 14px ${withAlpha(theme.colors.static.ink, 0.3)}`,
            border: "none",
            cursor: "pointer",
            color: theme.colors.textPrimary,
            fontSize: theme.typography.size.lg,
            transition: "background-color 120ms ease",
          }}
        >
          {/* These glyphs' visible ink sits well above the alphabetic
              baseline with almost no descender -- centering the span's own
              (line-height-based) box leaves the ink looking low. Nudged up
              to compensate, measured against the actual rendered glyph. */}
          <span aria-hidden style={{ lineHeight: 1, transform: "translateY(-2px)" }}>
            {menuOpen ? theme.icons.close : theme.icons.menu}
          </span>
        </button>

        <NavDropdownPanel open={menuOpen} align="left" id={navPanelId}>
          <NavMenuItemLink href="/" onClick={() => setMenuOpen(false)}>
            Home
          </NavMenuItemLink>

          {session && (
            <NavMenuExpandableItem
              label="Social"
              expanded={expandedSection === "social"}
              onToggle={() => toggleSection("social")}
            >
              <NavMenuItemLink href="/profile" onClick={() => setMenuOpen(false)} style={subsectionLinkStyle}>
                Profile
              </NavMenuItemLink>
              <NavMenuItemLink href="/leaderboard" onClick={() => setMenuOpen(false)} style={subsectionLinkStyle}>
                Leaderboard
              </NavMenuItemLink>
            </NavMenuExpandableItem>
          )}

          {session && (
            <NavMenuExpandableItem
              label="Exercise"
              expanded={expandedSection === "exercise"}
              onToggle={() => toggleSection("exercise")}
            >
              <NavMenuItemLink href="/track" onClick={() => setMenuOpen(false)} style={subsectionLinkStyle}>
                Current Workout
              </NavMenuItemLink>
              <NavMenuItemLink href="/history" onClick={() => setMenuOpen(false)} style={subsectionLinkStyle}>
                Workout Log
              </NavMenuItemLink>
            </NavMenuExpandableItem>
          )}

          <NavMenuExpandableItem
            label="Resources"
            expanded={expandedSection === "resources"}
            onToggle={() => toggleSection("resources")}
          >
            <NavMenuItemLink
              href="/resources/articles/how-much-power"
              onClick={() => setMenuOpen(false)}
              style={subsectionLinkStyle}
            >
              How Much Power?
            </NavMenuItemLink>
            <NavMenuItemLink
              href="/resources/articles/is-the-power-generation-worth-it"
              onClick={() => setMenuOpen(false)}
              style={subsectionLinkStyle}
            >
              Is It Cheaper?
            </NavMenuItemLink>
            <NavMenuItemLink
              href="/resources/equipment-analyzer"
              onClick={() => setMenuOpen(false)}
              style={subsectionLinkStyle}
            >
              Equipment Analyzer
            </NavMenuItemLink>
            <NavMenuItemLink href="/resources" onClick={() => setMenuOpen(false)} style={subsectionLinkStyle}>
              All Resources
            </NavMenuItemLink>
          </NavMenuExpandableItem>

          <NavMenuItemLink href="/resources/articles/what-is-elexercise" onClick={() => setMenuOpen(false)}>
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
          textDecoration: "none",
          gridColumn: 2,
          justifySelf: "center",
        }}
      >
        <Image src={logo} alt="" width={44} height={44} />
        {/* position: relative on the wordmark text itself (not a wrapper)
            -- the tagline below is positioned absolutely against exactly
            this box, so it's left-aligned with "elexercise!"'s own left
            edge and, being out of flow, never widens this flex item. That
            keeps the icon+wordmark centering (gridColumn 2, justifySelf
            center on the Link) exactly as it was before the tagline
            existed, regardless of the tagline's own width. */}
        <span
          className="site-header-wordmark-text"
          style={{
            position: "relative",
            color: theme.colors.themed.brandAccent,
            fontSize: theme.typography.size.lg,
            fontWeight: theme.typography.weight.bold,
            fontFamily: "'Clash Display', sans-serif",
          }}
        >
          elexercise!
          <span
            className="site-header-tagline"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              color: theme.colors.navy,
              opacity: 0.75,
              fontSize: theme.typography.size.xxs,
              whiteSpace: "nowrap",
            }}
          >
            a multimedia whitepaper by Noah Korotzer
          </span>
        </span>
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
                    color: theme.colors.themed.brandAccent,
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
                      fontFamily: familjenGrotesk.style.fontFamily,
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
                aria-label="Log in"
                onClick={() => {
                  if (sessionStorage.getItem("accessCodeVerified") === "true") {
                    setLoginOpen(true);
                  } else {
                    setAccessCodeOpen(true);
                  }
                }}
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
                <span>{theme.icons.login}</span>
              </button>
            )}
          </>
        )}
        </div>
      </div>

      <AccessCodeModal
        open={accessCodeOpen}
        onClose={() => setAccessCodeOpen(false)}
        onVerified={() => {
          setAccessCodeOpen(false);
          setLoginOpen(true);
        }}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </header>
    </>
  );
}

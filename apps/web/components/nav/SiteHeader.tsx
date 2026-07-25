"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { theme } from "@exercise-tracker/design-tokens";
import { supabase } from "../../lib/supabase";
import { useSupabaseSession } from "../../lib/useSession";
import { useProfile } from "../../lib/useProfile";
import { LoginModal } from "../auth/LoginModal";

// Fixed pixel height so the root layout can reserve matching space below it
// (a fixed-position element is out of flow and would otherwise overlap content).
export const HEADER_HEIGHT = 64;

export function SiteHeader() {
  const { session, loading } = useSupabaseSession();
  const { displayName } = useProfile(session?.user.id);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  async function handleSignOut() {
    setProfileMenuOpen(false);
    await supabase.auth.signOut();
    router.replace("/");
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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: theme.spacing.lg,
        paddingRight: theme.spacing.lg,
        backgroundColor: theme.colors.border,
      }}
    >
      <div>
        <button
          onClick={() => setMenuOpen((open) => !open)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.xs,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#ffffff",
            fontSize: theme.typography.size.md,
          }}
        >
          <span aria-hidden>☰</span>
          <span>Drop-down menu</span>
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: theme.spacing.xs,
              backgroundColor: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              padding: theme.spacing.md,
              minWidth: 200,
              zIndex: 1,
            }}
          >
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                fontWeight: theme.typography.weight.bold,
                color: theme.colors.textPrimary,
                marginBottom: theme.spacing.xs,
              }}
            >
              Home
            </Link>

            {session && (
              <>
                <p style={{ fontWeight: theme.typography.weight.bold, margin: 0, marginBottom: theme.spacing.xs }}>
                  Exercise Dashboard
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>
                  <Link href="/track" onClick={() => setMenuOpen(false)} style={{ color: theme.colors.textPrimary }}>
                    Current Workout
                  </Link>
                  <Link href="/history" onClick={() => setMenuOpen(false)} style={{ color: theme.colors.textPrimary }}>
                    Workout Log
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <Link
        href="/"
        style={{
          margin: 0,
          color: "#ffffff",
          fontFamily: theme.typography.fontFamily.mono,
          fontSize: theme.typography.size.lg,
          textDecoration: "none",
        }}
      >
        elexercise!
      </Link>

      <div style={{ position: "relative" }}>
        {!loading && (
          <>
            {session ? (
              <>
                <button
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.xs,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#ffffff",
                    fontSize: theme.typography.size.md,
                  }}
                >
                  <span aria-hidden>👤</span>
                  <span>{displayName ?? session.user.email}</span>
                </button>

                {profileMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: theme.spacing.xs,
                      backgroundColor: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      padding: theme.spacing.md,
                      minWidth: 160,
                      zIndex: 1,
                    }}
                  >
                    <Link
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      style={{
                        display: "block",
                        color: theme.colors.textPrimary,
                        fontSize: theme.typography.size.md,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => void handleSignOut()}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: theme.colors.textPrimary,
                        fontSize: theme.typography.size.md,
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.xs,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#ffffff",
                  fontSize: theme.typography.size.md,
                }}
              >
                <span aria-hidden>🔒</span>
                <span>User / Login</span>
              </button>
            )}
          </>
        )}
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}

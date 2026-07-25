"use client";

import { theme } from "@exercise-tracker/design-tokens";

const FOOTER_HEIGHT = 56;

export default function LandingPage() {
  return (
    <>
      {/* Footer is position:fixed (out of flow), so this wrapper reserves matching bottom padding. */}
      <div style={{ paddingBottom: FOOTER_HEIGHT }}>
        <section
          style={{
            backgroundColor: theme.colors.primaryGreen,
            padding: theme.spacing.xxl,
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, color: theme.colors.textPrimary }}>
            TODO: update hero image
          </p>
        </section>

        <section style={{ backgroundColor: "#ffffff", padding: theme.spacing.xxl }}>
          <h2 style={{ margin: 0, color: theme.colors.textPrimary }}>What is elexercise?</h2>
          <p style={{ marginTop: theme.spacing.xl, textAlign: "center", color: theme.colors.textMuted }}>
            TODO: add content for landing page
          </p>
        </section>
      </div>

      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: FOOTER_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.border,
        }}
      >
        <p style={{ margin: 0, color: "#ffffff" }}>TODO: polish footer</p>
      </footer>
    </>
  );
}

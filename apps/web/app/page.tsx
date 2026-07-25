"use client";

import { theme } from "@exercise-tracker/design-tokens";

export default function LandingPage() {
  return (
    <>
      <section
        style={{
          backgroundColor: theme.colors.primaryGreen,
          padding: theme.spacing.xxl,
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, color: theme.colors.textPrimary }}>TODO: update hero image</p>
      </section>

      <section style={{ backgroundColor: "#ffffff", padding: theme.spacing.xxl }}>
        <h2 style={{ margin: 0, color: theme.colors.textPrimary }}>What is elexercise?</h2>
        <p style={{ marginTop: theme.spacing.xl, textAlign: "center", color: theme.colors.textMuted }}>
          TODO: add content for landing page
        </p>
      </section>
    </>
  );
}

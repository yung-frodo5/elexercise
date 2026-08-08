"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { verifyAccessCode } from "../../lib/api";

const pillButtonStyle: CSSProperties = {
  padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
  borderRadius: theme.radii.pill,
  border: "none",
  background: theme.colors.primaryGreen,
  color: "#FFFFFF",
  fontWeight: theme.typography.weight.semibold,
  fontFamily: "'Clash Display', sans-serif",
  fontSize: theme.typography.size.sm,
  cursor: "pointer",
  width: "100%",
};

export function AccessCodeModal({
  open,
  onClose,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { valid } = await verifyAccessCode(code);
      if (valid) {
        sessionStorage.setItem("accessCodeVerified", "true");
        onVerified();
      } else {
        setError("Incorrect access code.");
      }
    } catch {
      setError("Something went wrong verifying the code. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          backgroundColor: theme.colors.static.darkPanelBg,
          padding: theme.spacing.xl,
          maxWidth: 360,
          width: "90%",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: theme.spacing.sm,
            right: theme.spacing.sm,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: theme.typography.size.md,
            color: "#FFFFFF",
          }}
        >
          {theme.icons.close}
        </button>
        <p
          style={{
            color: "#FFFFFF",
            marginTop: 0,
            fontWeight: theme.typography.weight.semibold,
            fontFamily: "'Clash Display', sans-serif",
            fontSize: theme.typography.size.sm,
          }}
        >
          ENTER ACCESS CODE
        </p>
        <p style={{ color: "#FFFFFF", fontSize: theme.typography.size.sm }}>
          Profile functionality is currently invite-only. Enter the access code you were given to
          create an account or sign in.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
          <input
            type="text"
            placeholder="Access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
          />
          {error && (
            <p style={{ color: theme.colors.static.errorInkOnDarkPanel, fontSize: theme.typography.size.sm }}>
              {error}
            </p>
          )}
          <button type="submit" style={pillButtonStyle} disabled={submitting}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

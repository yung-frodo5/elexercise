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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing.xs,
};

const spinnerStyle: CSSProperties = {
  width: 14,
  height: 14,
  borderRadius: "50%",
  border: "2px solid rgba(255, 255, 255, 0.4)",
  borderTopColor: "#FFFFFF",
  animation: "elexAccessCodeSpin 0.8s linear infinite",
};

const KEYFRAMES_ID = "elex-access-code-keyframes";

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes elexAccessCodeSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

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
  ensureKeyframes();

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
            disabled={submitting}
          />
          {error && (
            <p style={{ color: theme.colors.static.errorInkOnDarkPanel, fontSize: theme.typography.size.sm }}>
              {error}
            </p>
          )}
          <button type="submit" style={pillButtonStyle} disabled={submitting}>
            {submitting ? (
              <>
                <span style={spinnerStyle} />
                Checking…
              </>
            ) : (
              "Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

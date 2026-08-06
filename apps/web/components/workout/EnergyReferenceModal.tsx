"use client";

import Link from "next/link";
import { howMuchPowerArticle, type Table } from "@exercise-tracker/content";
import { theme } from "@exercise-tracker/design-tokens";
import { ArticleTable } from "../content/ArticleView";

const ENERGY_QUANTITIES_TABLE = howMuchPowerArticle.body.find((block): block is Table => block.type === "table")!;

export function EnergyReferenceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

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
          backgroundColor: theme.colors.themed.chromeBg,
          padding: theme.spacing.xl,
          maxWidth: 640,
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          borderRadius: theme.radii.lg,
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
            color: theme.colors.themed.navy,
          }}
        >
          {theme.icons.close}
        </button>
        <h2
          style={{
            color: theme.colors.themed.navy,
            marginTop: 0,
            marginBottom: theme.spacing.lg,
            fontSize: theme.typography.size.md,
            lineHeight: 1.5,
          }}
        >
          Reference Table -{" "}
          <Link href="/resources/articles/how-much-power" style={{ color: theme.colors.themed.link }}>
            How Much Power?
          </Link>
        </h2>
        <ArticleTable table={ENERGY_QUANTITIES_TABLE} />
      </div>
    </div>
  );
}

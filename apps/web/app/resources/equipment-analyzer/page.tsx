import { Fragment } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { Calculator } from "../../../components/calculator/Calculator";

const INTRO_LINES: { label: string; quote: string; align: "left" | "right" }[] = [
  { label: "The most common question", quote: "How much power could I generate?", align: "left" },
  { label: "The second most common question", quote: "How much would it be worth?", align: "left" },
  { label: "Our favorite answer", quote: "Don’t you want to find out?", align: "right" },
  { label: "Our second favorite answer", quote: "It’s complicated. Let me explain…", align: "right" },
];

export default function EquipmentAnalyzerPage() {
  return (
    <main style={{ padding: theme.spacing.xl, paddingTop: theme.spacing.xs, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginTop: 0, fontSize: theme.typography.size.lg }}>Equipment Analyzer</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs, color: theme.colors.navy }}>
        {INTRO_LINES.map(({ label, quote, align }, i) => (
          <Fragment key={label}>
            {i === 2 && <div aria-hidden style={{ height: theme.spacing.xl }} />}
            <p style={{ margin: 0, textAlign: align, fontSize: theme.typography.size.sm, fontStyle: "italic" }}>
              {label}: &ldquo;{quote}&rdquo;
            </p>
          </Fragment>
        ))}
      </div>

      <div style={{ marginTop: theme.spacing.xl }}>
        <Calculator />
      </div>
    </main>
  );
}

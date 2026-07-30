import { Fragment } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { Calculator } from "../../../components/calculator/Calculator";

const INTRO_LINES: { label: string; quote: string }[] = [
  { label: "The most common question", quote: "How much power could I generate?" },
  { label: "The second most common question", quote: "How much would it be worth?" },
  { label: "Our favorite answer", quote: "Don’t you want to find out?" },
  { label: "Our second favorite answer", quote: "It’s complicated. Let me explain…" },
];

export default function CalculatorPage() {
  return (
    <main style={{ padding: theme.spacing.xl, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Calculator</h1>
      {/* Below the breakpoint, the label/quote pairs no longer fit side by
          side without mid-phrase wrapping — collapse to a single column
          (each half on its own centered line) instead. Media queries need a
          real stylesheet rule, not an inline style, hence the <style> tag. */}
      <style>{`
        .intro-lines { display: grid; grid-template-columns: auto auto; justify-content: center; }
        .intro-label { text-align: right; }
        .intro-quote { text-align: left; }
        @media (max-width: 600px) {
          .intro-lines { grid-template-columns: 1fr; text-align: center; }
          .intro-label, .intro-quote { text-align: center; }
        }
      `}</style>
      <div
        className="intro-lines"
        style={{ columnGap: theme.spacing.xs, rowGap: theme.spacing.xs, color: theme.colors.textMuted }}
      >
        {INTRO_LINES.map(({ label, quote }) => (
          <Fragment key={label}>
            <span className="intro-label">{label}:</span>
            <span className="intro-quote">&ldquo;{quote}&rdquo;</span>
          </Fragment>
        ))}
      </div>

      <div style={{ marginTop: theme.spacing.xl }}>
        <Calculator />
      </div>
    </main>
  );
}

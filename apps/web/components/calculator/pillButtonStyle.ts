import { theme } from "@exercise-tracker/design-tokens";

// Shared by "Download CSV" (Calculator.tsx) and "Export to SVG" (CashFlowChart.tsx) -- same pill styling
// in both places, in files that otherwise don't import from each other.
export const pillButtonStyle = {
  padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
  borderRadius: theme.radii.pill,
  border: "none",
  background: "#6B7280",
  color: "#FFFFFF",
  fontWeight: theme.typography.weight.semibold,
  fontFamily: "'Clash Display', sans-serif",
  fontSize: theme.typography.size.sm,
  cursor: "pointer",
};

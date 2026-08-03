import { theme } from "@exercise-tracker/design-tokens";
import { Calculator } from "../../../components/calculator/Calculator";

export default function EquipmentAnalyzerPage() {
  return (
    <main style={{ padding: theme.spacing.xl, paddingTop: theme.spacing.xs, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginTop: 0, fontSize: theme.typography.size.lg }}>Equipment Analyzer</h1>

      <div style={{ marginTop: theme.spacing.xl }}>
        <Calculator />
      </div>
    </main>
  );
}

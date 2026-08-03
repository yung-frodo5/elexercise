import Link from "next/link";
import { theme } from "@exercise-tracker/design-tokens";

const RESOURCES: { href: string; title: string; description: string }[] = [
  {
    href: "/resources/equipment-analyzer",
    title: "Equipment Analyzer",
    description: "Calculate how much power you could generate and how much it'd be worth.",
  },
];

const cell = {
  padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
  textAlign: "left" as const,
  borderBottom: `1px solid #D6E9FF`,
  verticalAlign: "top" as const,
  fontSize: theme.typography.size.sm,
};

export default function ResourcesPage() {
  return (
    <main style={{ padding: theme.spacing.xl, maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: theme.typography.size.lg }}>Resources</h1>
      <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm }}>
        Tools and references for putting elexercise&rsquo;s ideas into practice.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: theme.spacing.lg }}>
        <thead>
          {/* Explicit static navy, not inherited -- this row's light-blue
              background doesn't invert in dark mode, so its text can't
              rely on inheriting the canvas's flipping default color. */}
          <tr style={{ backgroundColor: "#D6E9FF" }}>
            <th style={{ ...cell, color: theme.colors.navyStatic }}>Resource</th>
            <th style={{ ...cell, color: theme.colors.navyStatic }}>What it&rsquo;s for</th>
          </tr>
        </thead>
        <tbody>
          {RESOURCES.map((resource) => (
            <tr key={resource.href}>
              <td style={cell}>
                <Link href={resource.href} style={{ color: theme.colors.navy }}>
                  {resource.title}
                </Link>
              </td>
              <td style={{ ...cell, color: theme.colors.navy }}>{resource.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

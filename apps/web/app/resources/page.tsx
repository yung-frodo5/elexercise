import Link from "next/link";
import { theme } from "@exercise-tracker/design-tokens";

const RESOURCES: { href: string; title: string; description: string }[] = [
  {
    href: "/resources/calculator",
    title: "elexercise calculator",
    description: "Calculate how much power you could generate and how much it'd be worth.",
  },
];

const cell = {
  padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
  textAlign: "left" as const,
  borderBottom: `1px solid ${theme.colors.border}`,
  verticalAlign: "top" as const,
};

export default function ResourcesPage() {
  return (
    <main style={{ padding: theme.spacing.xl, maxWidth: 640 }}>
      <h1>Resources</h1>
      <p style={{ color: theme.colors.textMuted }}>
        Tools and references for putting elexercise&rsquo;s ideas into practice.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: theme.spacing.lg }}>
        <thead>
          <tr>
            <th style={cell}>Tool / resource</th>
            <th style={cell}>What it&rsquo;s for</th>
          </tr>
        </thead>
        <tbody>
          {RESOURCES.map((resource) => (
            <tr key={resource.href}>
              <td style={cell}>
                <Link href={resource.href} style={{ color: theme.colors.textPrimary }}>
                  {resource.title}
                </Link>
              </td>
              <td style={{ ...cell, color: theme.colors.textMuted }}>{resource.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

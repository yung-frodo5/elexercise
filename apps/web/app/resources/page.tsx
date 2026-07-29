import Link from "next/link";
import { theme } from "@exercise-tracker/design-tokens";

const RESOURCES: { href: string; title: string; description: string }[] = [
  {
    href: "/resources/calculator",
    title: "elexercise calculator",
    description: "Estimate the true cost per workout, including energy and carbon value.",
  },
];

export default function ResourcesPage() {
  return (
    <main style={{ padding: theme.spacing.xl, maxWidth: 640 }}>
      <h1>Resources</h1>
      <p style={{ color: theme.colors.textMuted }}>
        Tools and references for putting elexercise&rsquo;s ideas into practice.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.lg, marginTop: theme.spacing.lg }}>
        {RESOURCES.map((resource) => (
          <Link key={resource.href} href={resource.href} style={{ color: theme.colors.textPrimary, textDecoration: "none" }}>
            <h2 style={{ fontSize: theme.typography.size.lg, margin: 0 }}>{resource.title}</h2>
            <p style={{ color: theme.colors.textMuted, margin: 0 }}>{resource.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

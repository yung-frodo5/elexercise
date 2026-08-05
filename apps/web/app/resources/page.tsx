import Link from "next/link";
import { theme } from "@exercise-tracker/design-tokens";
import { articles } from "@exercise-tracker/content";

interface ResourceRow {
  href: string;
  title: string;
  description: string;
}

const TOOLS: ResourceRow[] = [
  {
    href: "/resources/equipment-analyzer",
    title: "Equipment Analyzer",
    description: "Calculate how much power you could generate and how much it'd be worth.",
  },
];

// Articles themselves live in packages/content (title, slug, body) --
// this is just the short teaser shown in the index table, keyed by slug so
// it doesn't need to change if an article's title or body changes.
const ARTICLE_DESCRIPTIONS: Record<string, string> = {
  "what-is-elexercise": "An introduction to elexercise and the idea behind it.",
  "is-the-power-generation-worth-it":
    "A look at the unit economics behind electricity-generating exercise equipment.",
  "how-much-power": "Scaling workout electricity from one person to one gym to the whole planet.",
};

const cell = {
  padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
  textAlign: "left" as const,
  borderBottom: `1px solid ${theme.colors.static.accentPanelBg}`,
  verticalAlign: "top" as const,
  fontSize: theme.typography.size.sm,
};

// One <tbody> per subsection (not a separate <table>) so every subsection's
// columns share the same <table>'s auto-sizing and stay a consistent width
// -- a <colgroup> would also need per-subsection duplication, whereas one
// table naturally sizes both columns from every row's content at once.
function ResourceSection({
  leftLabel,
  rightLabel,
  rows,
}: {
  leftLabel: string;
  rightLabel: string;
  rows: ResourceRow[];
}) {
  return (
    <tbody>
      {/* Explicit static navy, not inherited -- this row's light-blue
          background doesn't invert in dark mode, so its text can't
          rely on inheriting the canvas's flipping default color. */}
      <tr style={{ backgroundColor: theme.colors.static.accentPanelBg }}>
        <th style={{ ...cell, color: theme.colors.static.ink }}>{leftLabel}</th>
        <th style={{ ...cell, color: theme.colors.static.ink }}>{rightLabel}</th>
      </tr>
      {rows.map((resource) => (
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
  );
}

export default function ResourcesPage() {
  const articleRows: ResourceRow[] = articles.map((article) => ({
    href: `/resources/articles/${article.slug}`,
    title: article.title,
    description: ARTICLE_DESCRIPTIONS[article.slug] ?? "",
  }));

  return (
    <main style={{ padding: theme.spacing.xl, maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: theme.typography.size.lg }}>Resources</h1>
      <p style={{ color: theme.colors.navy, fontSize: theme.typography.size.sm }}>
        Tools and articles for putting elexercise&rsquo;s ideas into practice.
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: theme.spacing.lg,
          border: `1px solid ${theme.colors.static.accentPanelBg}`,
        }}
      >
        <ResourceSection leftLabel="Tool" rightLabel="What it’s for" rows={TOOLS} />
        <ResourceSection leftLabel="Article" rightLabel="Description" rows={articleRows} />
      </table>
    </main>
  );
}

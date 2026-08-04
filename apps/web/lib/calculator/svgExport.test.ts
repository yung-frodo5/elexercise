import { describe, it, expect } from "vitest";
import { buildExportableChartSvg } from "./svgExport";

function build(overrides: Partial<Parameters<typeof buildExportableChartSvg>[0]> = {}) {
  return buildExportableChartSvg({
    chartMarkup: '<svg class="recharts-surface"><line /></svg>',
    chartWidth: 400,
    chartHeight: 340,
    title: "Cost over time",
    legendItems: [{ name: "Bike", color: "#0033A0" }],
    textColor: "#0033A0",
    ...overrides,
  });
}

describe("buildExportableChartSvg", () => {
  it("wraps the original chart markup unchanged inside a translated group", () => {
    const svg = build();
    expect(svg).toContain('<g transform="translate(0, 32)"><svg class="recharts-surface"><line /></svg></g>');
  });

  it("renders a title text element sized to the chart width", () => {
    const svg = build({ title: "My Custom Title" });
    expect(svg).toContain('<text x="200" y="22" text-anchor="middle"');
    expect(svg).toContain(">My Custom Title<");
  });

  it("omits the title block entirely (and shrinks total height) when title is blank", () => {
    const svg = build({ title: "   " });
    expect(svg).not.toContain("text-anchor=\"middle\"");
    // No title row -> total height is just chart height + legend height (12 padding + 1 row of 20).
    expect(svg).toContain('height="372"');
    expect(svg).toContain('<g transform="translate(0, 0)">');
  });

  it("draws one legend swatch + label row per equipment item, in order", () => {
    const svg = build({
      legendItems: [
        { name: "Bike", color: "#111111" },
        { name: "Treadmill", color: "#222222" },
      ],
    });
    const bikeIndex = svg.indexOf(">Bike<");
    const treadmillIndex = svg.indexOf(">Treadmill<");
    expect(bikeIndex).toBeGreaterThan(-1);
    expect(treadmillIndex).toBeGreaterThan(bikeIndex);
    expect(svg).toContain('fill="#111111"');
    expect(svg).toContain('fill="#222222"');
  });

  it("omits the legend block and shrinks total height when there are no legend items", () => {
    const svg = build({ legendItems: [] });
    // 32 (title) + 340 (chart) + 0 (no legend).
    expect(svg).toContain('height="372"');
  });

  it("escapes special characters in the title and equipment names", () => {
    const svg = build({
      title: `A & B <script> "quoted"`,
      legendItems: [{ name: `<img onerror="x">`, color: "#0033A0" }],
    });
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("A &amp; B &lt;script&gt; &quot;quoted&quot;");
    expect(svg).toContain("&lt;img onerror=&quot;x&quot;&gt;");
  });

  it("starts with an XML declaration and closes the outer <svg> as the final element", () => {
    const svg = build();
    expect(svg.startsWith('<?xml version="1.0" standalone="no"?>')).toBe(true);
    expect(svg.trim().endsWith("</svg>")).toBe(true);
  });
});

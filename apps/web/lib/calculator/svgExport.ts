export interface SvgLegendItem {
  name: string;
  color: string;
}

// Escapes text for safe embedding as SVG/XML text content — chart title and equipment names are
// free text and can contain &, <, >, or quotes.
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const TITLE_HEIGHT = 32;
const LEGEND_TOP_PADDING = 12;
const LEGEND_ROW_HEIGHT = 20;
const LEGEND_LEFT_PADDING = 16;
const LEGEND_SWATCH_SIZE = 12;

// Builds a standalone, self-contained SVG document string for downloading: recharts renders its
// <Legend> as an HTML sibling of the chart's own <svg> (not inside it), so grabbing just the chart's
// <svg> markup would silently drop the equipment name/color key. This instead re-draws the title and
// legend as plain SVG shapes around the original chart markup, so the exported file is valid,
// self-contained vector SVG with no HTML/foreignObject dependency.
export function buildExportableChartSvg(options: {
  chartMarkup: string;
  chartWidth: number;
  chartHeight: number;
  title: string;
  legendItems: SvgLegendItem[];
  textColor: string;
}): string {
  const { chartMarkup, chartWidth, chartHeight, title, legendItems, textColor } = options;
  const trimmedTitle = title.trim();

  const titleHeight = trimmedTitle ? TITLE_HEIGHT : 0;
  const legendHeight = legendItems.length > 0 ? LEGEND_TOP_PADDING + legendItems.length * LEGEND_ROW_HEIGHT : 0;
  const totalHeight = titleHeight + chartHeight + legendHeight;

  const titleText = trimmedTitle
    ? `<text x="${chartWidth / 2}" y="${titleHeight / 2 + 6}" text-anchor="middle" font-family="'Clash Display', sans-serif" font-size="16" font-weight="700" fill="${escapeXml(textColor)}">${escapeXml(trimmedTitle)}</text>`
    : "";

  const legendRows = legendItems
    .map((item, i) => {
      const y = titleHeight + chartHeight + LEGEND_TOP_PADDING + i * LEGEND_ROW_HEIGHT;
      const swatch = `<rect x="${LEGEND_LEFT_PADDING}" y="${y}" width="${LEGEND_SWATCH_SIZE}" height="${LEGEND_SWATCH_SIZE}" fill="${escapeXml(item.color)}" />`;
      const label = `<text x="${LEGEND_LEFT_PADDING + LEGEND_SWATCH_SIZE + 8}" y="${y + LEGEND_SWATCH_SIZE - 2}" font-family="'Clash Display', sans-serif" font-size="13" fill="${escapeXml(textColor)}">${escapeXml(item.name)}</text>`;
      return swatch + label;
    })
    .join("");

  return [
    '<?xml version="1.0" standalone="no"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${chartWidth}" height="${totalHeight}" viewBox="0 0 ${chartWidth} ${totalHeight}">`,
    `<rect x="0" y="0" width="${chartWidth}" height="${totalHeight}" fill="#FFFFFF" />`,
    titleText,
    `<g transform="translate(0, ${titleHeight})">${chartMarkup}</g>`,
    legendRows,
    "</svg>",
  ]
    .filter(Boolean)
    .join("\n");
}

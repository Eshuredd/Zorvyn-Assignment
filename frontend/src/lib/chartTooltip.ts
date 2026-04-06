/** Shared Recharts Tooltip props for dark UI — item rows ignore contentStyle.color. */
export const barChartTooltipProps = {
  cursor: false as const,
  contentStyle: {
    borderRadius: 8,
    border: "1px solid hsl(217 33% 28%)",
    background: "hsl(222 40% 15%)",
    color: "hsl(210 40% 98%)",
    fontSize: 12,
  },
  labelStyle: {
    color: "hsl(210 40% 98%)",
    fontWeight: 600,
  },
  itemStyle: {
    color: "hsl(210 40% 98%)",
  },
} as const;

/** Light overlay on the hovered bar only (not the full category band). */
export const activeBarHighlight = {
  fill: "hsl(210 40% 98%)",
  fillOpacity: 0.14,
} as const;

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { activeBarHighlight, barChartTooltipProps } from "@/lib/chartTooltip";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { mockCategorySpending, mockMonthlyTrends, mockTransactions } from "@/services/mockData";

const DONUT_COLORS = ["#1a6b3a", "#5b3fd1", "#185fa5", "#b8680a", "#0f6e56", "#888780"];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function AnalyticsPage() {
  const { income, expense, marginPct, avgTxn, topCategory } = useMemo(() => {
    const inc = mockTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = mockTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const margin = inc > 0 ? ((inc - exp) / inc) * 100 : 0;
    const avg = mockTransactions.length ? Math.round((inc + exp) / mockTransactions.length) : 0;
    const byCat = new Map<string, number>();
    mockTransactions
      .filter((t) => t.type === "income")
      .forEach((t) => byCat.set(t.category, (byCat.get(t.category) || 0) + t.amount));
    let top = "—";
    let topAmt = 0;
    byCat.forEach((v, k) => {
      if (v > topAmt) {
        topAmt = v;
        top = k;
      }
    });
    return { marginPct: margin.toFixed(1), avgTxn: avg, topCategory: top };
  }, []);

  const catBarData = useMemo(() => {
    const m = new Map<string, number>();
    mockTransactions.forEach((t) => m.set(t.category, (m.get(t.category) || 0) + t.amount));
    return [...m.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, []);

  return (
    <>
      <header className="page-shell-header">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Trends, margins, and category breakdown</p>
      </header>

      <div className="page-shell-body space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <StatCard
            title="Gross Margin"
            value={`${marginPct}%`}
            trend="↑ 3.2pp vs last period"
            trendTone="up"
            valueClassName="text-primary font-mono"
          />
          <StatCard
            title="Avg. Transaction"
            value={fmt(avgTxn)}
            trend={`across ${mockTransactions.length} records`}
            trendTone="neutral"
            valueClassName="font-mono"
          />
          <StatCard
            title="Top Category"
            value={topCategory}
            trend={topCategory !== "—" ? `${fmt(mockTransactions.filter((t) => t.category === topCategory && t.type === "income").reduce((s, t) => s + t.amount, 0))} · income` : "—"}
            trendTone="up"
            valueClassName="text-lg tracking-tight"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
          <Card className="rounded-xl border-border p-5 shadow-sm">
            <p className="mb-4 text-[13px] font-medium text-foreground">Income vs Expense — Monthly</p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockMonthlyTrends} barGap={4}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fontFamily: "DM Mono, monospace" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${Number(v) / 1000}k`}
                  />
                  <Tooltip formatter={(value: number) => fmt(value)} {...barChartTooltipProps} />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: "DM Mono, monospace" }} />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="hsl(158 45% 32%)"
                    stroke="hsl(158 52% 48%)"
                    strokeWidth={1.5}
                    radius={[4, 4, 0, 0]}
                    activeBar={{ ...activeBarHighlight, radius: [4, 4, 0, 0] }}
                  />
                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="hsl(6 50% 38%)"
                    stroke="hsl(6 57% 55%)"
                    strokeWidth={1.5}
                    radius={[4, 4, 0, 0]}
                    activeBar={{ ...activeBarHighlight, radius: [4, 4, 0, 0] }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-xl border-border p-5 shadow-sm">
            <p className="mb-4 text-[13px] font-medium text-foreground">Expense Distribution</p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockCategorySpending}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                    dataKey="amount"
                    nameKey="category"
                    stroke="hsl(222 40% 15%)"
                    strokeWidth={2}
                  >
                    {mockCategorySpending.map((_, i) => (
                      <Cell key={i} fill={`${DONUT_COLORS[i % DONUT_COLORS.length]}bb`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => fmt(value)} {...barChartTooltipProps} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="rounded-xl border-border p-5 shadow-sm">
          <p className="mb-4 text-[13px] font-medium text-foreground">Category Totals</p>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catBarData}>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: "DM Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${Number(v) / 1000}k`}
                />
                <Tooltip formatter={(value: number) => fmt(value)} {...barChartTooltipProps} />
                <Bar
                  dataKey="amount"
                  radius={[3, 3, 0, 0]}
                  strokeWidth={1.5}
                  activeBar={{ ...activeBarHighlight, radius: [3, 3, 0, 0] }}
                >
                  {catBarData.map((_, i) => (
                    <Cell key={i} fill={`${DONUT_COLORS[i % DONUT_COLORS.length]}33`} stroke={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}

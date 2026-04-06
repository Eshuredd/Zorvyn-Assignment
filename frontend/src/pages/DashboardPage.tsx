import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { activeBarHighlight, barChartTooltipProps } from "@/lib/chartTooltip";
import { mockTransactions, mockMonthlyTrends } from "@/services/mockData";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const CAT_COLORS = ["#1a6b3a", "#5b3fd1", "#185fa5", "#b8680a", "#0f6e56", "#888780", "#c0392b", "#3266ad"];

function formatShortDate(iso: string) {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const { totalIncome, totalExpenses, netBalance, recent, categoryRows } = useMemo(() => {
    const income = mockTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = mockTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const sorted = [...mockTransactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    const m = new Map<string, number>();
    mockTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => m.set(t.category, (m.get(t.category) || 0) + t.amount));
    const rows = [...m.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 9);
    return {
      totalIncome: income,
      totalExpenses: expense,
      netBalance: income - expense,
      recent: sorted,
      categoryRows: rows,
    };
  }, []);

  return (
    <>
      <header className="page-shell-header">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Financial overview — your latest period</p>
      </header>

      <div className="page-shell-body space-y-6">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <StatCard
            title="Total Income"
            value={fmt(totalIncome)}
            trend="↑ 12.4% vs last period"
            trendTone="up"
            valueClassName="text-[hsl(146_61%_26%)]"
          />
          <StatCard
            title="Total Expenses"
            value={fmt(totalExpenses)}
            trend="↑ 8.1% vs last period"
            trendTone="down"
            valueClassName="text-[hsl(6_57%_46%)]"
          />
          <StatCard
            title="Net Balance"
            value={`${netBalance >= 0 ? "+" : "−"}${fmt(Math.abs(netBalance))}`}
            trend={netBalance >= 0 ? "Surplus this period" : "Deficit this period"}
            trendTone={netBalance >= 0 ? "up" : "down"}
            valueClassName={netBalance >= 0 ? "text-primary" : "text-[hsl(6_57%_46%)]"}
          />
          <StatCard
            title="Total Records"
            value={String(mockTransactions.length)}
            trend="Transaction entries in dataset"
            trendTone="neutral"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card className="rounded-xl border-border p-5 shadow-sm">
            <p className="mb-4 text-[13px] font-medium text-foreground">Monthly Trend</p>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockMonthlyTrends} barGap={4} barCategoryGap="18%">
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fontFamily: "DM Mono, monospace" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${Number(v) / 1000}k`}
                  />
                  <Tooltip formatter={(value: number) => fmt(value)} {...barChartTooltipProps} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, fontFamily: "DM Mono, monospace" }} />
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
            <p className="mb-4 text-[13px] font-medium text-foreground">By Category</p>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={categoryRows} margin={{ left: 4, right: 8 }}>
                  <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fontFamily: "DM Mono, monospace" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${Number(v) / 1000}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={88}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip formatter={(value: number) => fmt(value)} {...barChartTooltipProps} />
                  <Bar
                    dataKey="amount"
                    radius={[0, 3, 3, 0]}
                    strokeWidth={1.5}
                    activeBar={{ ...activeBarHighlight, radius: [0, 3, 3, 0] }}
                  >
                    {categoryRows.map((_, i) => (
                      <Cell
                        key={i}
                        fill={`${CAT_COLORS[i % CAT_COLORS.length]}33`}
                        stroke={CAT_COLORS[i % CAT_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="rounded-xl border-border p-5 shadow-sm">
          <div className="ledger-section-header">
            <p className="text-[13px] font-medium text-foreground">Recent Activity</p>
            <Link to="/transactions" className="cursor-pointer text-[12px] text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="flex flex-col">
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 border-b border-border/80 py-2.5 last:border-b-0"
              >
                <div
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    r.type === "income" ? "bg-[hsl(146_61%_26%)]" : "bg-[hsl(6_57%_46%)]"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-foreground">{r.description}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatShortDate(r.date)} · {r.category}
                  </p>
                </div>
                <p
                  className={`shrink-0 font-mono text-[13px] font-medium ${
                    r.type === "income" ? "text-[hsl(146_61%_26%)]" : "text-[hsl(6_57%_46%)]"
                  }`}
                >
                  {r.type === "income" ? "+" : "−"}
                  {fmt(r.amount)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

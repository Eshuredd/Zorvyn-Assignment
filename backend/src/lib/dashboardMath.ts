import { RecordType } from "@prisma/client";

export type TrendRowInput = { date: Date; amount: number; type: RecordType };

export type MonthlyTrend = {
  month: string;
  income: number;
  expense: number;
  net: number;
};

export function monthKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function buildMonthlyTrends(rows: TrendRowInput[]): MonthlyTrend[] {
  const map = new Map<string, { income: number; expense: number }>();
  for (const r of rows) {
    const key = monthKey(r.date);
    const cur = map.get(key) ?? { income: 0, expense: 0 };
    if (r.type === RecordType.INCOME) cur.income += r.amount;
    else cur.expense += r.amount;
    map.set(key, cur);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      income: round2(v.income),
      expense: round2(v.expense),
      net: round2(v.income - v.expense),
    }));
}

export type CategoryRowInput = { category: string; amount: number; type: RecordType };

export type CategoryBreakdownRow = {
  category: string;
  income: number;
  expense: number;
  net: number;
};

export function buildCategoryBreakdown(rows: CategoryRowInput[]): CategoryBreakdownRow[] {
  const map = new Map<string, { income: number; expense: number }>();
  for (const r of rows) {
    const cur = map.get(r.category) ?? { income: 0, expense: 0 };
    if (r.type === RecordType.INCOME) cur.income += r.amount;
    else cur.expense += r.amount;
    map.set(r.category, cur);
  }
  return [...map.entries()]
    .map(([category, v]) => ({
      category,
      income: round2(v.income),
      expense: round2(v.expense),
      net: round2(v.income - v.expense),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

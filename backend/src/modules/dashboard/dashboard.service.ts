import { RecordStatus, RecordType } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { decimalToNumber } from "../../lib/decimal.js";
import { buildCategoryBreakdown, buildMonthlyTrends } from "../../lib/dashboardMath.js";
import type { DashboardRangeQuery, RecentActivityQuery } from "./dashboard.schemas.js";

function baseWhere(range: DashboardRangeQuery): Prisma.FinancialRecordWhereInput {
  const where: Prisma.FinancialRecordWhereInput = {
    status: { not: RecordStatus.VOID },
  };
  if (range.from || range.to) {
    where.date = {};
    if (range.from) where.date.gte = new Date(range.from);
    if (range.to) where.date.lte = new Date(range.to);
  }
  return where;
}

export async function getSummary(range: DashboardRangeQuery) {
  const where = baseWhere(range);
  const [income, expense, count] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: { ...where, type: RecordType.INCOME },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: { ...where, type: RecordType.EXPENSE },
      _sum: { amount: true },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  const totalIncome = decimalToNumber(income._sum.amount);
  const totalExpenses = decimalToNumber(expense._sum.amount);
  return {
    totalIncome,
    totalExpenses,
    netBalance: Math.round((totalIncome - totalExpenses) * 100) / 100,
    recordCount: count,
  };
}

export async function getCategoryBreakdown(range: DashboardRangeQuery) {
  const where = baseWhere(range);
  const grouped = await prisma.financialRecord.groupBy({
    by: ["category", "type"],
    where,
    _sum: { amount: true },
  });
  const rows = grouped.map((g) => ({
    category: g.category,
    amount: decimalToNumber(g._sum.amount),
    type: g.type,
  }));
  return { categories: buildCategoryBreakdown(rows) };
}

export async function getTrends(range: DashboardRangeQuery) {
  const where = baseWhere(range);
  const rows = await prisma.financialRecord.findMany({
    where,
    select: { date: true, amount: true, type: true },
    orderBy: { date: "asc" },
  });
  const mapped = rows.map((r) => ({
    date: r.date,
    amount: decimalToNumber(r.amount),
    type: r.type,
  }));
  return { trends: buildMonthlyTrends(mapped) };
}

export async function getRecentActivity(q: RecentActivityQuery) {
  const where = baseWhere(q);
  const rows = await prisma.financialRecord.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: q.limit,
    include: {
      createdBy: { select: { id: true, email: true, name: true } },
    },
  });
  return {
    items: rows.map((r) => ({
      id: r.id,
      amount: decimalToNumber(r.amount),
      type: r.type,
      category: r.category,
      date: r.date.toISOString(),
      notes: r.notes,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      createdBy: r.createdBy,
    })),
  };
}

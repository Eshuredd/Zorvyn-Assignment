import { describe, expect, it } from "vitest";
import { RecordType } from "@prisma/client";
import { buildCategoryBreakdown, buildMonthlyTrends } from "./dashboardMath.js";

describe("dashboardMath", () => {
  it("aggregates monthly income, expense, and net", () => {
    const trends = buildMonthlyTrends([
      { date: new Date("2025-01-10T00:00:00.000Z"), amount: 100, type: RecordType.INCOME },
      { date: new Date("2025-01-20T00:00:00.000Z"), amount: 40, type: RecordType.EXPENSE },
      { date: new Date("2025-02-05T00:00:00.000Z"), amount: 200, type: RecordType.INCOME },
    ]);
    expect(trends).toEqual([
      { month: "2025-01", income: 100, expense: 40, net: 60 },
      { month: "2025-02", income: 200, expense: 0, net: 200 },
    ]);
  });

  it("aggregates category breakdown", () => {
    const rows = buildCategoryBreakdown([
      { category: "Food", amount: 50, type: RecordType.EXPENSE },
      { category: "Food", amount: 30, type: RecordType.EXPENSE },
      { category: "Salary", amount: 1000, type: RecordType.INCOME },
    ]);
    expect(rows).toEqual([
      { category: "Food", income: 0, expense: 80, net: -80 },
      { category: "Salary", income: 1000, expense: 0, net: 1000 },
    ]);
  });
});

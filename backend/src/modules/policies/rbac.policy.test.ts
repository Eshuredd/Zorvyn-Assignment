import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import {
  canManageUsers,
  canViewDashboardAnalytics,
  canViewDashboardBasics,
  canWriteRecords,
} from "./rbac.policy.js";

describe("RBAC policy", () => {
  it("only ADMIN can mutate records or manage users", () => {
    expect(canWriteRecords(Role.ADMIN)).toBe(true);
    expect(canWriteRecords(Role.ANALYST)).toBe(false);
    expect(canWriteRecords(Role.VIEWER)).toBe(false);

    expect(canManageUsers(Role.ADMIN)).toBe(true);
    expect(canManageUsers(Role.ANALYST)).toBe(false);
  });

  it("all roles can view basic dashboard slices", () => {
    for (const role of [Role.VIEWER, Role.ANALYST, Role.ADMIN]) {
      expect(canViewDashboardBasics(role)).toBe(true);
    }
  });

  it("only ANALYST and ADMIN can view analytics dashboard", () => {
    expect(canViewDashboardAnalytics(Role.VIEWER)).toBe(false);
    expect(canViewDashboardAnalytics(Role.ANALYST)).toBe(true);
    expect(canViewDashboardAnalytics(Role.ADMIN)).toBe(true);
  });
});

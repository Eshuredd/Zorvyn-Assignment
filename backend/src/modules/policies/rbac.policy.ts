import { Role } from "@prisma/client";

export function canWriteRecords(role: Role): boolean {
  return role === Role.ADMIN;
}

export function canManageUsers(role: Role): boolean {
  return role === Role.ADMIN;
}

/** Summary + recent activity (high-level dashboard). */
export function canViewDashboardBasics(role: Role): boolean {
  return role === Role.VIEWER || role === Role.ANALYST || role === Role.ADMIN;
}

/** Category breakdown and monthly trends. */
export function canViewDashboardAnalytics(role: Role): boolean {
  return role === Role.ANALYST || role === Role.ADMIN;
}

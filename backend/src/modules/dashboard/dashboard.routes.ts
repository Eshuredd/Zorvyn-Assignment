import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requirePolicy } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validate.js";
import {
  canViewDashboardAnalytics,
  canViewDashboardBasics,
} from "../policies/rbac.policy.js";
import * as controller from "./dashboard.controller.js";
import { dashboardRangeQuerySchema, recentActivityQuerySchema } from "./dashboard.schemas.js";

const r = Router();

r.use(authenticate);

r.get(
  "/summary",
  requirePolicy(canViewDashboardBasics),
  validateRequest({ query: dashboardRangeQuerySchema }),
  controller.summary,
);

r.get(
  "/recent-activity",
  requirePolicy(canViewDashboardBasics),
  validateRequest({ query: recentActivityQuerySchema }),
  controller.recentActivity,
);

r.get(
  "/category-breakdown",
  requirePolicy(canViewDashboardAnalytics),
  validateRequest({ query: dashboardRangeQuerySchema }),
  controller.categoryBreakdown,
);

r.get(
  "/trends",
  requirePolicy(canViewDashboardAnalytics),
  validateRequest({ query: dashboardRangeQuerySchema }),
  controller.trends,
);

export const dashboardRouter = r;

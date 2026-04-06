import type { Request, Response, NextFunction } from "express";
import { ok } from "../../lib/apiResponse.js";
import * as dashboardService from "./dashboard.service.js";
import type { DashboardRangeQuery, RecentActivityQuery } from "./dashboard.schemas.js";

export async function summary(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query as unknown as DashboardRangeQuery;
    const data = await dashboardService.getSummary(query);
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

export async function categoryBreakdown(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query as unknown as DashboardRangeQuery;
    const data = await dashboardService.getCategoryBreakdown(query);
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

export async function trends(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query as unknown as DashboardRangeQuery;
    const data = await dashboardService.getTrends(query);
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

export async function recentActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query as unknown as RecentActivityQuery;
    const data = await dashboardService.getRecentActivity(query);
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

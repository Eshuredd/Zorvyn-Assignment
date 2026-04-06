import { z } from "zod";

export const dashboardRangeQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const recentActivityQuerySchema = dashboardRangeQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type DashboardRangeQuery = z.infer<typeof dashboardRangeQuerySchema>;
export type RecentActivityQuery = z.infer<typeof recentActivityQuerySchema>;

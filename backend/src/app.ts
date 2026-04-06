import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { recordsRouter } from "./modules/records/records.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, data: { status: "ok" } });
  });

  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/records", recordsRouter);
  app.use("/dashboard", dashboardRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
  });

  app.use(errorHandler);

  return app;
}

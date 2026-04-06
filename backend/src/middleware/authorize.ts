import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";

export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!allowed.includes(req.user.role)) {
      return next(
        new ForbiddenError("Insufficient permissions for this action", "FORBIDDEN_ROLE"),
      );
    }
    next();
  };
}

export function requirePolicy(
  check: (role: Role) => boolean,
  message = "Insufficient permissions for this action",
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!check(req.user.role)) {
      return next(new ForbiddenError(message, "FORBIDDEN_POLICY"));
    }
    next();
  };
}

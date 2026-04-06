import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../lib/jwt.js";
import { UnauthorizedError } from "../lib/errors.js";
import { UserStatus } from "@prisma/client";

function extractBearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) return null;
  return h.slice("Bearer ".length).trim() || null;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractBearer(req);
    if (!token) {
      throw new UnauthorizedError("Missing bearer token");
    }
    const { sub } = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: { id: true, email: true, role: true, status: true, name: true },
    });
    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError("Account is inactive");
    }
    req.user = user;
    next();
  } catch (e) {
    next(
      e instanceof UnauthorizedError
        ? e
        : new UnauthorizedError("Invalid or expired token"),
    );
  }
}

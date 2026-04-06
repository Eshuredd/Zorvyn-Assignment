import type { Request, Response, NextFunction } from "express";
import { ok } from "../../lib/apiResponse.js";
import * as authService from "./auth.service.js";
import type { LoginBody } from "./auth.schemas.js";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as LoginBody;
    const data = await authService.login(body);
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const data = await authService.getMe(userId);
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

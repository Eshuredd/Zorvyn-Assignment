import type { Request, Response, NextFunction } from "express";
import { ok } from "../../lib/apiResponse.js";
import * as usersService from "./users.service.js";
import type { CreateUserBody, UpdateUserBody, UpdateUserStatusBody } from "./users.schemas.js";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as CreateUserBody;
    const data = await usersService.createUser(body);
    res.status(201).json(ok(data));
  } catch (e) {
    next(e);
  }
}

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await usersService.listUsers();
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = req.body as UpdateUserBody;
    const data = await usersService.updateUser(id, body);
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = req.body as UpdateUserStatusBody;
    const data = await usersService.updateUserStatus(id, body);
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

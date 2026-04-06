import type { Request, Response, NextFunction } from "express";
import { ok } from "../../lib/apiResponse.js";
import * as recordsService from "./records.service.js";
import type { CreateRecordBody, ListRecordsQuery, UpdateRecordBody } from "./records.schemas.js";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as CreateRecordBody;
    const data = await recordsService.createRecord(req.user!.id, body);
    res.status(201).json(ok(data));
  } catch (e) {
    next(e);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query as unknown as ListRecordsQuery;
    const data = await recordsService.listRecords(query);
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await recordsService.getRecord(req.params.id);
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as UpdateRecordBody;
    const data = await recordsService.updateRecord(req.params.id, body);
    res.status(200).json(ok(data));
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await recordsService.deleteRecord(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

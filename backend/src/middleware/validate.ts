import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";
import { ValidationRequestError } from "../lib/errors.js";

type RequestPart = "body" | "query" | "params";

export function validate(part: RequestPart, schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      (req as unknown as Record<string, unknown>)[part] = parsed;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return next(new ValidationRequestError("Validation failed", e.flatten()));
      }
      next(e);
    }
  };
}

export function validateRequest(schemas: Partial<Record<RequestPart, ZodTypeAny>>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request["query"];
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request["params"];
      }
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return next(new ValidationRequestError("Validation failed", e.flatten()));
      }
      next(e);
    }
  };
}

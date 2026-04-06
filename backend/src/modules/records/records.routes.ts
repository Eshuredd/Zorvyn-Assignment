import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validate.js";
import * as controller from "./records.controller.js";
import {
  createRecordBodySchema,
  listRecordsQuerySchema,
  recordIdParamsSchema,
  updateRecordBodySchema,
} from "./records.schemas.js";

const r = Router();

r.use(authenticate);

r.get("/", validateRequest({ query: listRecordsQuerySchema }), controller.list);
r.get("/:id", validateRequest({ params: recordIdParamsSchema }), controller.getOne);

r.post(
  "/",
  requireRole(Role.ADMIN),
  validateRequest({ body: createRecordBodySchema }),
  controller.create,
);

r.patch(
  "/:id",
  requireRole(Role.ADMIN),
  validateRequest({ params: recordIdParamsSchema, body: updateRecordBodySchema }),
  controller.update,
);

r.delete(
  "/:id",
  requireRole(Role.ADMIN),
  validateRequest({ params: recordIdParamsSchema }),
  controller.remove,
);

export const recordsRouter = r;

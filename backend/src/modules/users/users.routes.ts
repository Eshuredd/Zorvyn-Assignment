import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/authorize.js";
import { validateRequest } from "../../middleware/validate.js";
import * as controller from "./users.controller.js";
import {
  createUserBodySchema,
  updateUserBodySchema,
  updateUserStatusBodySchema,
  userIdParamsSchema,
} from "./users.schemas.js";

const r = Router();

r.use(authenticate);
r.use(requireRole(Role.ADMIN));

r.post("/", validateRequest({ body: createUserBodySchema }), controller.create);
r.get("/", controller.list);
r.patch(
  "/:id/status",
  validateRequest({ params: userIdParamsSchema, body: updateUserStatusBodySchema }),
  controller.updateStatus,
);
r.patch(
  "/:id",
  validateRequest({ params: userIdParamsSchema, body: updateUserBodySchema }),
  controller.update,
);

export const usersRouter = r;

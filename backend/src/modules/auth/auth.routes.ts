import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import * as controller from "./auth.controller.js";
import { loginBodySchema } from "./auth.schemas.js";

const r = Router();

r.post("/login", validate("body", loginBodySchema), controller.login);
r.get("/me", authenticate, controller.me);

export const authRouter = r;

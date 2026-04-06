import { z } from "zod";
import { Role, UserStatus } from "@prisma/client";

export const createUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().max(120).optional(),
  role: z.nativeEnum(Role).optional(),
});

export const updateUserBodySchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().max(120).nullable().optional(),
    role: z.nativeEnum(Role).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "At least one field is required" });

export const updateUserStatusBodySchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export const userIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export type UpdateUserStatusBody = z.infer<typeof updateUserStatusBodySchema>;

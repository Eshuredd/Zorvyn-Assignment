import { UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { verifyPassword } from "../../lib/password.js";
import { signAccessToken } from "../../lib/jwt.js";
import { UnauthorizedError } from "../../lib/errors.js";
import type { LoginBody } from "./auth.schemas.js";

export async function login(input: LoginBody) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
  }
  if (user.status !== UserStatus.ACTIVE) {
    throw new UnauthorizedError("Account is inactive", "ACCOUNT_INACTIVE");
  }
  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const token = signAccessToken(user.id);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    throw new UnauthorizedError("User no longer exists");
  }
  return user;
}

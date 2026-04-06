import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/password.js";
import { NotFoundError } from "../../lib/errors.js";
import type { CreateUserBody, UpdateUserBody, UpdateUserStatusBody } from "./users.schemas.js";

export async function createUser(input: CreateUserBody) {
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name ?? null,
      role: input.role ?? undefined,
    },
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
  return user;
}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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
}

export async function updateUser(id: string, input: UpdateUserBody) {
  const data: Prisma.UserUpdateInput = {};
  if (input.email !== undefined) data.email = input.email;
  if (input.name !== undefined) data.name = input.name;
  if (input.role !== undefined) data.role = input.role;

  try {
    return await prisma.user.update({
      where: { id },
      data,
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
  } catch {
    throw new NotFoundError("User");
  }
}

export async function updateUserStatus(id: string, input: UpdateUserStatusBody) {
  try {
    return await prisma.user.update({
      where: { id },
      data: { status: input.status },
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
  } catch {
    throw new NotFoundError("User");
  }
}

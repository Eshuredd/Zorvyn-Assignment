import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { decimalToNumber } from "../../lib/decimal.js";
import { NotFoundError } from "../../lib/errors.js";
import type { CreateRecordBody, ListRecordsQuery, UpdateRecordBody } from "./records.schemas.js";

function serializeRecord<T extends { amount: Prisma.Decimal }>(row: T) {
  return {
    ...row,
    amount: decimalToNumber(row.amount),
  };
}

export async function createRecord(createdById: string, input: CreateRecordBody) {
  const row = await prisma.financialRecord.create({
    data: {
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: new Date(input.date),
      notes: input.notes ?? null,
      status: input.status ?? undefined,
      createdById,
    },
    include: {
      createdBy: { select: { id: true, email: true, name: true } },
    },
  });
  return serializeRecord(row);
}

function buildWhere(q: ListRecordsQuery): Prisma.FinancialRecordWhereInput {
  const where: Prisma.FinancialRecordWhereInput = {};
  if (q.type) where.type = q.type;
  if (q.category) where.category = { contains: q.category };
  if (q.dateFrom || q.dateTo) {
    where.date = {};
    if (q.dateFrom) where.date.gte = new Date(q.dateFrom);
    if (q.dateTo) where.date.lte = new Date(q.dateTo);
  }
  if (q.search?.trim()) {
    const s = q.search.trim();
    where.OR = [
      { notes: { contains: s } },
      { category: { contains: s } },
    ];
  }
  return where;
}

export async function listRecords(q: ListRecordsQuery) {
  const where = buildWhere(q);
  const skip = (q.page - 1) * q.pageSize;
  const [total, rows] = await prisma.$transaction([
    prisma.financialRecord.count({ where }),
    prisma.financialRecord.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip,
      take: q.pageSize,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
      },
    }),
  ]);
  return {
    items: rows.map(serializeRecord),
    page: q.page,
    pageSize: q.pageSize,
    total,
    totalPages: Math.ceil(total / q.pageSize) || 1,
  };
}

export async function getRecord(id: string) {
  const row = await prisma.financialRecord.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, email: true, name: true } },
    },
  });
  if (!row) throw new NotFoundError("Financial record");
  return serializeRecord(row);
}

export async function updateRecord(id: string, input: UpdateRecordBody) {
  const data: Prisma.FinancialRecordUpdateInput = {};
  if (input.amount !== undefined) data.amount = input.amount;
  if (input.type !== undefined) data.type = input.type;
  if (input.category !== undefined) data.category = input.category;
  if (input.date !== undefined) data.date = new Date(input.date);
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.status !== undefined) data.status = input.status;

  try {
    const row = await prisma.financialRecord.update({
      where: { id },
      data,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
      },
    });
    return serializeRecord(row);
  } catch {
    throw new NotFoundError("Financial record");
  }
}

export async function deleteRecord(id: string) {
  try {
    await prisma.financialRecord.delete({ where: { id } });
  } catch {
    throw new NotFoundError("Financial record");
  }
}

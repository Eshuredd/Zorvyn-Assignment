import { z } from "zod";
import { RecordType, RecordStatus } from "@prisma/client";

const money = z.coerce
  .number()
  .refine((n) => Number.isFinite(n) && n > 0, { message: "Amount must be a positive number" });

export const createRecordBodySchema = z.object({
  amount: money,
  type: z.nativeEnum(RecordType),
  category: z.string().min(1).max(80),
  date: z.string().datetime(),
  notes: z.string().max(2000).optional(),
  status: z.nativeEnum(RecordStatus).optional(),
});

export const updateRecordBodySchema = z
  .object({
    amount: money.optional(),
    type: z.nativeEnum(RecordType).optional(),
    category: z.string().min(1).max(80).optional(),
    date: z.string().datetime().optional(),
    notes: z.string().max(2000).nullable().optional(),
    status: z.nativeEnum(RecordStatus).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "At least one field is required" });

export const listRecordsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: z.nativeEnum(RecordType).optional(),
  category: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().max(200).optional(),
});

export const recordIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type CreateRecordBody = z.infer<typeof createRecordBodySchema>;
export type UpdateRecordBody = z.infer<typeof updateRecordBodySchema>;
export type ListRecordsQuery = z.infer<typeof listRecordsQuerySchema>;

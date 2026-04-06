import { Prisma } from "@prisma/client";

export function decimalToNumber(value: Prisma.Decimal | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return Number(value.toString());
}

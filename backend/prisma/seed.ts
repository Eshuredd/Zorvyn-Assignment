import { PrismaClient, RecordStatus, RecordType, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
      name: "Admin User",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@example.com" },
    update: {},
    create: {
      email: "analyst@example.com",
      passwordHash,
      name: "Analyst User",
      role: Role.ANALYST,
      status: UserStatus.ACTIVE,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@example.com" },
    update: {},
    create: {
      email: "viewer@example.com",
      passwordHash,
      name: "Viewer User",
      role: Role.VIEWER,
      status: UserStatus.ACTIVE,
    },
  });

  const inactive = await prisma.user.upsert({
    where: { email: "inactive@example.com" },
    update: {},
    create: {
      email: "inactive@example.com",
      passwordHash,
      name: "Inactive User",
      role: Role.VIEWER,
      status: UserStatus.INACTIVE,
    },
  });

  const count = await prisma.financialRecord.count();
  if (count === 0) {
    const baseDate = new Date("2025-01-15T12:00:00.000Z");
    const records = [
      {
        amount: 5000,
        type: RecordType.INCOME,
        category: "Salary",
        date: new Date(baseDate),
        notes: "Monthly salary",
        status: RecordStatus.CONFIRMED,
        createdById: admin.id,
      },
      {
        amount: 1200,
        type: RecordType.INCOME,
        category: "Freelance",
        date: new Date("2025-02-10T12:00:00.000Z"),
        notes: "Contract work",
        status: RecordStatus.CONFIRMED,
        createdById: analyst.id,
      },
      {
        amount: 450,
        type: RecordType.EXPENSE,
        category: "Food",
        date: new Date("2025-02-12T12:00:00.000Z"),
        notes: "Groceries",
        status: RecordStatus.CONFIRMED,
        createdById: admin.id,
      },
      {
        amount: 89.5,
        type: RecordType.EXPENSE,
        category: "Transport",
        date: new Date("2025-02-14T12:00:00.000Z"),
        notes: "Transit pass",
        status: RecordStatus.CONFIRMED,
        createdById: admin.id,
      },
      {
        amount: 200,
        type: RecordType.EXPENSE,
        category: "Food",
        date: new Date("2025-03-01T12:00:00.000Z"),
        notes: "Dining out",
        status: RecordStatus.PENDING,
        createdById: analyst.id,
      },
      {
        amount: 3000,
        type: RecordType.INCOME,
        category: "Salary",
        date: new Date("2025-03-15T12:00:00.000Z"),
        notes: "March salary",
        status: RecordStatus.CONFIRMED,
        createdById: admin.id,
      },
      {
        amount: 150,
        type: RecordType.EXPENSE,
        category: "Utilities",
        date: new Date("2025-03-20T12:00:00.000Z"),
        notes: "Electric bill",
        status: RecordStatus.CONFIRMED,
        createdById: admin.id,
      },
      {
        amount: 100,
        type: RecordType.EXPENSE,
        category: "Adjustments",
        date: new Date("2025-03-21T12:00:00.000Z"),
        notes: "Voided sample (excluded from dashboard totals)",
        status: RecordStatus.VOID,
        createdById: admin.id,
      },
    ];

    await prisma.financialRecord.createMany({ data: records });
  }

  console.log("Seed complete:", { admin: admin.email, analyst: analyst.email, viewer: viewer.email, inactive: inactive.email });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

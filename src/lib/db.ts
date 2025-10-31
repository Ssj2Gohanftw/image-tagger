// src/lib/db.ts
import { PrismaClient } from "@/generated/prisma";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in environment");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

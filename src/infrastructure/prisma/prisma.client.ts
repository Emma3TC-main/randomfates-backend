import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../../config/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = env.databaseUrl;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const adapter = new PrismaPg({
  connectionString,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

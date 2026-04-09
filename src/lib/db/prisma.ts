import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 1. PostgreSQL bağlantı havuzunu (pool) oluştur
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Prisma v7'nin zorunlu kıldığı adaptörü bağla
const adapter = new PrismaPg(pool);

// 3. PrismaClient'ı adaptör ile ayağa kaldır
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
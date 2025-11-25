// @ts-ignore
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

// Prevent crash in browser environment where process might be undefined/polyfilled differently
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
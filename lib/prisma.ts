// @ts-ignore
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: any };

// Prevent instantiation in browser to avoid "fs" module errors
export const prisma = typeof window === 'undefined'
  ? (globalForPrisma.prisma || new PrismaClient({ log: ['query'] }))
  : {} as any;

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
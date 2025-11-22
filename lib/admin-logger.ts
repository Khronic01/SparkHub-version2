import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export const logAdminAction = async (
  adminId: string,
  action: string,
  targetId?: string,
  details?: string
) => {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';

    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetId,
        details,
        ipAddress
      }
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
};

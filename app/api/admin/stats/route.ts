
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Mock Auth Check: Ensure first user is admin
    const user = await prisma.user.findFirst();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalUsers, totalIdeas, totalTasks, transactions] = await Promise.all([
        prisma.user.count(),
        prisma.idea.count(),
        prisma.task.count({ where: { status: 'COMPLETED' } }),
        prisma.cryptoTransaction.aggregate({
            _sum: { amount: true }
        })
    ]);

    return NextResponse.json({
        totalUsers,
        totalIdeas,
        totalTasks,
        totalVolume: transactions._sum.amount || 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

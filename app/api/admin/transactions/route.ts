
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const txs = await prisma.cryptoTransaction.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            wallet: {
                include: {
                    user: { select: { email: true } }
                }
            }
        }
    });

    return NextResponse.json(txs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

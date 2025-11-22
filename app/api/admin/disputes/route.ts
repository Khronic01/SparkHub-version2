import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/admin-logger';

export async function GET(request: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const disputes = await prisma.dispute.findMany({
        where: { status: 'OPEN' },
        include: {
            initiator: { select: { name: true, email: true } },
            task: { select: { title: true, id: true } }
        }
    });

    return NextResponse.json(disputes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const user = await prisma.user.findFirst();
        if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { disputeId, resolution } = await request.json();

        // In a real app, perform wallet logic here (Refund vs Release)
        // ...

        const dispute = await prisma.dispute.update({
            where: { id: disputeId },
            data: {
                status: 'RESOLVED',
                resolution
            }
        });

        // Admin Log
        await logAdminAction(user.id, 'DISPUTE_RESOLUTION', disputeId, `Resolved as ${resolution}`);

        return NextResponse.json(dispute);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

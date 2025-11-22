import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/admin-logger';

export async function GET(request: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            xp: true,
            createdAt: true
        }
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const user = await prisma.user.findFirst();
        if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { userId, role } = body;

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        // Admin Log
        await logAdminAction(user.id, 'USER_ROLE_CHANGE', userId, `Changed role to ${role}`);

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

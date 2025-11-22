
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, message, link } = body;

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type || 'INFO',
        message,
        link,
        read: false
      }
    });

    return NextResponse.json(notification);
  } catch (error: any) {
    console.error('Create Notification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

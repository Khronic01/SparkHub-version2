import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, sanitize, isSpam } from '@/lib/security';

export async function POST(request: Request) {
  try {
    // 1. Rate Limit
    const isAllowed = await rateLimit(30, 60000); // 30 messages per min
    if (!isAllowed) {
      return NextResponse.json({ error: 'Messaging too fast.' }, { status: 429 });
    }

    const body = await request.json();
    const { conversationId, content, attachments } = body;

    if (!conversationId || (!content && (!attachments || attachments.length === 0))) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 2. Sanitize
    const safeContent = content ? sanitize(content) : '';
    if (safeContent && isSpam(safeContent)) {
       return NextResponse.json({ error: 'Message flagged as spam.' }, { status: 400 });
    }

    // Mock Auth
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify participation
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: user.id }
    });

    if (!isParticipant) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: safeContent,
        attachments: attachments || []
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(message);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

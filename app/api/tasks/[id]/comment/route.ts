import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GamificationService } from '@/services/gamification';
import { rateLimit, sanitize, isSpam } from '@/lib/security';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Rate Limit
    const isAllowed = await rateLimit(20, 60000); 
    if (!isAllowed) {
      return NextResponse.json({ error: 'Slow down! You are commenting too fast.' }, { status: 429 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // 2. Sanitize & Spam
    const safeContent = sanitize(content);
    if (isSpam(safeContent)) {
        return NextResponse.json({ error: 'Comment flagged as spam.' }, { status: 400 });
    }

    // Mock user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const comment = await prisma.comment.create({
      data: {
        content: safeContent,
        taskId: id,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Gamification: Award XP for commenting
    await GamificationService.awardXP(user.id, 'COMMENT');

    return NextResponse.json(comment);
  } catch (error: any) {
    console.error('Task Comment Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GamificationService } from '@/services/gamification';
import { rateLimit, sanitize, isSpam } from '@/lib/security';

export async function POST(request: Request) {
  try {
    // 1. Rate Limit
    const isAllowed = await rateLimit(10, 60000); // 10 requests per minute
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { title, description, category, tags, attachments } = body;

    if (!title || !description || !category) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Sanitize & Spam Check
    const safeTitle = sanitize(title);
    const safeDescription = sanitize(description);

    if (isSpam(safeTitle) || isSpam(safeDescription)) {
        return NextResponse.json({ error: 'Your content was flagged as spam.' }, { status: 400 });
    }

    // Mock Auth
    const user = await prisma.user.findFirst();
    if (!user) {
        return NextResponse.json({ error: 'No user found. Please run the seed script.' }, { status: 401 });
    }

    // Format tags
    const tagList = tags 
      ? tags.split(',').map((t: string) => sanitize(t)).filter((t: string) => t.length > 0)
      : [];

    const idea = await prisma.idea.create({
      data: {
        title: safeTitle,
        content: safeDescription,
        category,
        tags: tagList,
        attachments: attachments || [],
        authorId: user.id
      }
    });

    // Gamification: Award XP for creating an idea
    await GamificationService.awardXP(user.id, 'CREATE_IDEA');

    return NextResponse.json({ success: true, ideaId: idea.id });
  } catch (error: any) {
    console.error("Create Idea Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

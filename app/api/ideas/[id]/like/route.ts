import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GamificationService } from '@/services/gamification';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check existing like
    const existingLike = await prisma.like.findFirst({
      where: {
        ideaId: id,
        userId: user.id,
      },
    });

    let isLiked = false;

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      isLiked = false;
    } else {
      // Like
      const newLike = await prisma.like.create({
        data: {
          ideaId: id,
          userId: user.id,
        },
        include: {
            idea: true // Include idea to get author
        }
      });
      isLiked = true;

      // Gamification: Award XP to the idea author (Receiving a like)
      if (newLike.idea.authorId !== user.id) {
          await GamificationService.awardXP(newLike.idea.authorId, 'RECEIVE_LIKE');
      }
    }

    // Get updated count
    const count = await prisma.like.count({
      where: { ideaId: id },
    });

    return NextResponse.json({ success: true, isLiked, likesCount: count });
  } catch (error: any) {
    console.error('Like Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

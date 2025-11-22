
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GamificationService } from '@/services/gamification';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        badges: {
            include: {
                badge: true
            }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const level = GamificationService.calculateLevel(user.xp);
    const nextLevelProgress = GamificationService.calculateProgress(user.xp);

    return NextResponse.json({
      xp: user.xp,
      level,
      nextLevelProgress,
      completedTasks: user.completedTasks,
      badges: user.badges.map(ub => ub.badge),
      streak: user.currentStreak
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

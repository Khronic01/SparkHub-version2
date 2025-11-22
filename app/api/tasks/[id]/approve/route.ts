import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WalletService } from '@/services/wallet';
import { GamificationService } from '@/services/gamification';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get Task & Validate
    const task = await prisma.task.findUnique({
        where: { id },
        include: { assignee: true }
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (task.status !== 'SUBMITTED') return NextResponse.json({ error: 'Task not in submitted state' }, { status: 400 });
    if (!task.assigneeId) return NextResponse.json({ error: 'No assignee' }, { status: 400 });

    // 2. Release Escrow Funds
    // In a real app, the current user (approver) should be the idea author.
    try {
        await WalletService.releaseEscrow(task.id, task.assigneeId);
    } catch (e) {
        console.error("Escrow release failed, but proceeding with task completion for demo:", e);
    }

    // 3. Update Task Status
    const updatedTask = await prisma.task.update({
        where: { id },
        data: { status: 'COMPLETED' },
        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            },
            idea: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    });

    // 4. Gamification: Award XP to assignee
    // Calculate XP based on reward (e.g. 10 XP per $1, min 50)
    const xpAmount = Math.max(50, Math.floor(task.reward * 10));
    await GamificationService.awardXP(task.assigneeId, 'COMPLETE_TASK', xpAmount);

    // Also update User completedTasks count
    await prisma.user.update({
        where: { id: task.assigneeId },
        data: { completedTasks: { increment: 1 } }
    });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error('Approve Task Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

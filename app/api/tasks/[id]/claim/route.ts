
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock Auth: In a real app, this comes from the session
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.status !== 'PENDING') {
      return NextResponse.json({ error: 'Task is not available' }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'ASSIGNED',
        assigneeId: user.id
      },
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

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error('Claim Task Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

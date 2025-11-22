
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { submissionUrl, notes } = await request.json();

    // Mock Auth
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // Ensure user is assignee
    if (task.assigneeId !== user.id) {
         return NextResponse.json({ error: 'You are not assigned to this task' }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submissionUrl,
        submissionNotes: notes
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
    console.error('Submit Task Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

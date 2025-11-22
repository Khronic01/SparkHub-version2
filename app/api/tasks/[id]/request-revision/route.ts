import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock Auth: In a real app, check if user is the Idea Author (Task Owner)
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Task is not waiting for review' }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'ASSIGNED', // Send back to assignee
        // In a real app, you'd append to a revision history or comments
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
    
    // TODO: Create Notification for assignee

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error('Request Revision Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Mock Auth: In a real app, retrieve session.user.id
    const user = await prisma.user.findFirst(); 
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: user.id
      },
      include: {
        idea: {
          select: {
            id: true,
            title: true
          }
        },
        assignee: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Get Tasks Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

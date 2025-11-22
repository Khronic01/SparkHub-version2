
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ideaId, title, description, skill, reward, deliveryDays } = body;

    if (!ideaId || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real app, verify current user is the author of the idea
    // const session = await getServerSession(authOptions);
    // const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    // if (idea.authorId !== session.user.id) throw new Error('Unauthorized');

    const task = await prisma.task.create({
      data: {
        ideaId,
        title,
        description,
        skill: skill || 'General',
        reward: parseFloat(reward) || 0,
        deliveryDays: parseInt(deliveryDays) || 1,
        status: 'PENDING'
      },
      include: {
        assignee: {
            select: {
                name: true,
                image: true
            }
        }
      }
    });

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Create Task Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

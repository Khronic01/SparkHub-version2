
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock session user
    const currentUser = await prisma.user.findFirst();

    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tasks: {
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        },
        tags: true, // Assuming tags might be a relation, if it's a string[] scalar, this is ignored or fine
        _count: {
          select: { likes: true, comments: true },
        },
        likes: {
          where: {
            userId: currentUser?.id || '',
          },
          select: {
            userId: true,
          }
        },
        comments: {
          orderBy: {
            createdAt: 'desc',
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
        },
      },
    });

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // Transform response to include 'isLiked' boolean
    const response = {
      ...idea,
      isLiked: idea.likes.length > 0,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Get Idea Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

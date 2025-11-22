
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Mock Auth: Get first user
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: user.id }
        }
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const formatted = conversations.map(conv => {
      // Determine name (if direct, use other person's name)
      let name = conv.name;
      let avatar = null;
      
      if (conv.type === 'DIRECT') {
        const other = conv.participants.find(p => p.userId !== user.id)?.user;
        name = other?.name || 'Unknown User';
        avatar = other?.image;
      }

      return {
        id: conv.id,
        name: name,
        avatar: avatar,
        updatedAt: conv.updatedAt,
        lastMessage: conv.messages[0]?.content || '',
        type: conv.type
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

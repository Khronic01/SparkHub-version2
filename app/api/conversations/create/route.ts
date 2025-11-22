
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { targetUserId } = await request.json();
    
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (targetUserId === user.id) {
        return NextResponse.json({ error: 'Cannot chat with self' }, { status: 400 });
    }

    // Check for existing direct conversation
    // Complex query: Find conversation where BOTH users are participants and type is DIRECT
    // Simplifying for scaffold: 
    const conversations = await prisma.conversation.findMany({
        where: {
            type: 'DIRECT',
            participants: {
                every: {
                    userId: { in: [user.id, targetUserId] }
                }
            }
        },
        include: { participants: true }
    });

    // Filter strictly for size 2 and containing both
    const existing = conversations.find(c => 
        c.participants.length === 2 && 
        c.participants.some(p => p.userId === targetUserId) &&
        c.participants.some(p => p.userId === user.id)
    );

    if (existing) {
        return NextResponse.json({ id: existing.id });
    }

    // Create new
    const newConv = await prisma.conversation.create({
        data: {
            type: 'DIRECT',
            participants: {
                create: [
                    { userId: user.id },
                    { userId: targetUserId }
                ]
            }
        }
    });

    return NextResponse.json({ id: newConv.id });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

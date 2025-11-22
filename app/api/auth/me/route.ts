
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    // For scaffold, return the first user as 'me'
    const user = await prisma.user.findFirst({
        select: { id: true, name: true, email: true, image: true }
    });
    
    if (!user) return NextResponse.json({ error: 'No users found' }, { status: 404 });
    return NextResponse.json(user);
}

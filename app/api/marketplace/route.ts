
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category');

        const items = await prisma.marketplaceItem.findMany({
            where: {
                AND: [
                    { title: { contains: search, mode: 'insensitive' } },
                    category ? { category: { equals: category } } : {}
                ]
            },
            include: {
                seller: {
                    select: { name: true, image: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

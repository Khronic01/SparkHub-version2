
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const item = await prisma.marketplaceItem.findUnique({
            where: { id },
            include: {
                seller: {
                    select: { id: true, name: true, image: true, role: true }
                }
            }
        });
        
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        // Check if current user bought it (Mock user)
        const user = await prisma.user.findFirst();
        let isPurchased = false;
        if (user) {
            const purchase = await prisma.purchase.findFirst({
                where: { buyerId: user.id, itemId: id }
            });
            isPurchased = !!purchase;
        }

        // If purchased or seller, reveal contentUrl, else hide it
        // Note: In a real app, we shouldn't return contentUrl unless purchased.
        // Here we return it but the UI can choose to show/hide, or we mask it.
        // Let's mask it for security in API.
        const safeItem = {
            ...item,
            contentUrl: (isPurchased || (user && user.id === item.sellerId)) ? item.contentUrl : null,
            isPurchased
        };

        return NextResponse.json(safeItem);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WalletService } from '@/services/wallet';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId } = body;

    // Mock Buyer
    const buyer = await prisma.user.findFirst();
    if (!buyer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get Item
    const item = await prisma.marketplaceItem.findUnique({
        where: { id: itemId }
    });
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    // Process Payment
    await WalletService.processMarketplacePurchase(buyer.id, item.sellerId, item.price, item.id);

    // Record Purchase
    const purchase = await prisma.purchase.create({
        data: {
            buyerId: buyer.id,
            itemId: item.id,
            pricePaid: item.price
        }
    });

    return NextResponse.json({ 
        success: true, 
        purchaseId: purchase.id,
        downloadUrl: item.contentUrl 
    });

  } catch (error: any) {
    console.error('Marketplace Buy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

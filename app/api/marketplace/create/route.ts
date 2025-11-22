
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, price, category, previewImage, contentUrl } = body;

    if (!title || !description || !price || !contentUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mock User as seller
    const seller = await prisma.user.findFirst();
    if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const item = await prisma.marketplaceItem.create({
        data: {
            title,
            description,
            price: parseFloat(price),
            category: category || 'General',
            previewImage,
            contentUrl,
            sellerId: seller.id
        }
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Create Marketplace Item Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

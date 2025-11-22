import { NextResponse } from 'next/server';
import { WalletService } from '@/services/wallet';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    const wallet = await WalletService.createWallet(userId);
    return NextResponse.json(wallet);
  } catch (error: any) {
    console.error('Wallet Create Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

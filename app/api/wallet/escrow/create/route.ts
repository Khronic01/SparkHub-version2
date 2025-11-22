import { NextResponse } from 'next/server';
import { WalletService } from '@/services/wallet';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, taskId, amount } = body;

    if (!userId || !taskId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = await WalletService.createEscrow(userId, taskId, parseFloat(amount));
    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Escrow Create Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { WalletService } from '@/services/wallet';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, contributorUserId } = body;

    if (!taskId || !contributorUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = await WalletService.releaseEscrow(taskId, contributorUserId);
    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Escrow Release Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

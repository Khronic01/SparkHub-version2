import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, sanitize } from '@/lib/security';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Rate Limit
    const isAllowed = await rateLimit(5, 60000); // 5 reports per minute
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason, details, type } = body; // type could be 'IDEA' or 'COMMENT'

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    // Mock Auth
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const safeReason = sanitize(reason);
    const safeDetails = details ? sanitize(details) : '';

    const reportData: any = {
      reason: safeReason,
      details: safeDetails,
      reporterId: user.id,
    };

    if (type === 'COMMENT') {
      reportData.commentId = id;
    } else {
      reportData.ideaId = id;
    }

    const report = await prisma.report.create({
      data: reportData
    });

    return NextResponse.json({ success: true, reportId: report.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

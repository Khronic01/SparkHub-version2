
import { NextResponse } from 'next/server';
import { AssignmentService } from '@/services/assignment';

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json();
    if (!taskId) return NextResponse.json({ error: 'TaskId required' }, { status: 400 });

    const assignee = await AssignmentService.autoAssignTask(taskId);

    if (assignee) {
        return NextResponse.json({ success: true, assignee: assignee.name });
    } else {
        return NextResponse.json({ success: false, message: 'No eligible candidates found' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

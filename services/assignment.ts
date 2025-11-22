
import { prisma } from '@/lib/prisma';

export const AssignmentService = {
  /**
   * Calculate ranking score for a contributor.
   * Score = XP * 0.6 + (CompletedTasks * 2) + (Rating * 10) - (ResponseTime/60)
   * Note: Rating and ResponseTime are mocked/derived for this scaffold as they are not fully tracked yet.
   */
  calculateRanking(user: any) {
    // Mock stats for now
    const rating = 4.5; // out of 5
    const avgResponseTimeMins = 120; 

    const score = 
      (user.xp * 0.6) + 
      (user.completedTasks * 2) + 
      (rating * 10) - 
      (avgResponseTimeMins / 60);
      
    return score;
  },

  /**
   * Find eligible contributors and auto-assign the best one.
   */
  async autoAssignTask(taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.status !== 'PENDING') return null;

    // 1. Find Candidates (Users with matching skill)
    // For scaffold, we match strictly on skill string or allow General
    const requiredSkill = task.skill || 'General';
    
    // In a real app, User model would have a skills array or relation.
    // Here we just fetch top active users as candidates
    const candidates = await prisma.user.findMany({
        where: {
            role: 'USER',
            // skills: { has: requiredSkill } // if we had array
        },
        take: 20
    });

    if (candidates.length === 0) return null;

    // 2. Rank Candidates
    const ranked = candidates.map(user => ({
        user,
        score: this.calculateRanking(user)
    })).sort((a, b) => b.score - a.score);

    const bestCandidate = ranked[0].user;

    // 3. Assign
    // Use transaction to create assignment record and update task
    await prisma.$transaction(async (tx) => {
        await tx.taskAssignment.create({
            data: {
                taskId,
                userId: bestCandidate.id,
                status: 'ACCEPTED' // Auto-accept for this flow
            }
        });

        await tx.task.update({
            where: { id: taskId },
            data: {
                status: 'ASSIGNED',
                assigneeId: bestCandidate.id
            }
        });
        
        // Optional: Create Notification
        await tx.notification.create({
            data: {
                userId: bestCandidate.id,
                type: 'SUCCESS',
                message: `You have been assigned to task: ${task.title}`,
                link: `/tasks/${task.id}`
            }
        });
    });

    return bestCandidate;
  }
};

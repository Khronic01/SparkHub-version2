
import { prisma } from '@/lib/prisma';

export const GamificationService = {
  /**
   * Award XP to a user and check for level ups or badges.
   */
  async awardXP(userId: string, action: 'CREATE_IDEA' | 'COMPLETE_TASK' | 'RECEIVE_LIKE' | 'COMMENT', customAmount?: number) {
    // Define XP Rules
    const rules = {
      CREATE_IDEA: 10,
      COMPLETE_TASK: customAmount || 50, // Tasks can have variable XP based on reward/difficulty
      RECEIVE_LIKE: 2,
      COMMENT: 1
    };

    const amount = rules[action];
    if (!amount) return;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    // --- Streak Calculation ---
    const now = new Date();
    let newStreak = user.currentStreak;
    const lastActivity = user.lastActivityDate; // Date object from DB

    if (lastActivity) {
      // Normalize dates to compare days only
      const lastDate = new Date(lastActivity);
      lastDate.setHours(0, 0, 0, 0);
      
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 0) {
        // Same day, do nothing to streak
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    } else {
      // First activity ever
      newStreak = 1;
    }

    // Update User XP and Streak
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: amount },
        lastActivityDate: now,
        currentStreak: newStreak
      }
    });

    console.log(`[Gamification] Awarded ${amount} XP to user ${userId} for ${action}. Streak: ${newStreak}`);

    // Check for Badges
    await this.checkAndAwardBadges(userId, action, updatedUser);

    return updatedUser;
  },

  /**
   * Calculate level based on XP.
   * Strategy: Level 1 = 0-99 XP, Level 2 = 100-199 XP, etc.
   */
  calculateLevel(xp: number) {
    return Math.floor(xp / 100) + 1;
  },

  calculateProgress(xp: number) {
    return xp % 100; // Progress to next level (0-99)
  },

  /**
   * Logic to check and award badges based on user stats and recent action
   */
  async checkAndAwardBadges(userId: string, action: string, user: any) {
    const earnedBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true }
    });
    const earnedCodes = new Set(earnedBadges.map(ub => ub.badge.code));

    const badgesToAward: string[] = [];

    // 1. Early Builder: Create first idea
    if (action === 'CREATE_IDEA' && !earnedCodes.has('EARLY_BUILDER')) {
       const ideaCount = await prisma.idea.count({ where: { authorId: userId } });
       if (ideaCount >= 1) badgesToAward.push('EARLY_BUILDER');
    }

    // 2. Rising Contributor: Complete first task
    if (action === 'COMPLETE_TASK' && !earnedCodes.has('RISING_CONTRIBUTOR')) {
        const taskCount = await prisma.task.count({ where: { assigneeId: userId, status: 'COMPLETED' } });
        if (taskCount >= 1) badgesToAward.push('RISING_CONTRIBUTOR');
    }

    // 3. Community Voice: 10 Comments
    if (action === 'COMMENT' && !earnedCodes.has('COMMUNITY_VOICE')) {
        const commentCount = await prisma.comment.count({ where: { authorId: userId } });
        if (commentCount >= 10) badgesToAward.push('COMMUNITY_VOICE');
    }

    // 4. Streak Master: 7 day streak
    if (!earnedCodes.has('STREAK_MASTER') && user.currentStreak >= 7) {
        badgesToAward.push('STREAK_MASTER');
    }

    // Perform Awards
    for (const code of badgesToAward) {
        const badge = await prisma.badge.findUnique({ where: { code } });
        if (badge) {
            await prisma.userBadge.create({
                data: {
                    userId,
                    badgeId: badge.id
                }
            });
            console.log(`[Gamification] Awarded badge ${code} to ${userId}`);
            // Ideally emit a socket event here for real-time toast if we had socket access here
        }
    }
  }
};

// @ts-ignore
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Clean DB
  await prisma.notification.deleteMany();
  await prisma.cryptoTransaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.task.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.user.deleteMany();
  await prisma.badge.deleteMany();

  // 2. Create Badges
  const badges = [
    { code: 'EARLY_BUILDER', name: 'Early Builder', description: 'Created an idea in the early days', icon: 'Hammer' },
    { code: 'RISING_CONTRIBUTOR', name: 'Rising Contributor', description: 'Completed first task', icon: 'TrendingUp' },
    { code: 'COMMUNITY_VOICE', name: 'Community Voice', description: 'Posted 10 comments', icon: 'MessageCircle' },
    { code: 'STREAK_MASTER', name: 'Streak Master', description: '7 day activity streak', icon: 'Flame' },
    { code: 'POWER_USER', name: 'Power User', description: 'Completed 100 tasks', icon: 'Zap' },
    { code: 'COMMUNITY_PILLAR', name: 'Community Pillar', description: 'Posted 50 comments', icon: 'Users' },
  ];

  for (const b of badges) {
    await prisma.badge.create({ data: b });
  }

  // 3. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sparkhub.com',
      name: 'Admin User',
      password: passwordHash,
      role: 'ADMIN',
      wallet: { create: { address: '0xAdminWallet', balance: 10000 } }
    }
  });

  // Creators
  const creators = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `creator${i}@sparkhub.com`,
        name: `Creator ${i}`,
        password: passwordHash,
        role: 'USER',
        wallet: { create: { address: `0xCreator${i}`, balance: 1000 } }
      }
    });
    creators.push(user);
  }

  // Contributors
  const contributors = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `contributor${i}@sparkhub.com`,
        name: `Contributor ${i}`,
        password: passwordHash,
        role: 'USER',
        xp: 0,
        wallet: { create: { address: `0xContributor${i}`, balance: 0 } }
      }
    });
    contributors.push(user);
  }

  // 4. Create Ideas & Tasks
  console.log('💡 Creating ideas and tasks...');
  
  for (const creator of creators) {
    // Create 2 Ideas per Creator
    for (let j = 1; j <= 2; j++) {
      const idea = await prisma.idea.create({
        data: {
          title: `Project ${creator.name} - Idea ${j}`,
          content: `This is a revolutionary idea about ${j === 1 ? 'AI automation' : 'Sustainable Energy'}...`,
          category: j === 1 ? 'Technology' : 'Sustainability',
          tags: ['innovation', 'future', 'dev'],
          authorId: creator.id,
          attachments: [`https://picsum.photos/seed/${creator.id}-${j}/800/600`],
        }
      });

      // Create 3 Tasks per Idea
      for (let k = 1; k <= 3; k++) {
        await prisma.task.create({
          data: {
            ideaId: idea.id,
            title: `Build Component ${k}`,
            description: `We need a React component that handles feature ${k}.`,
            skill: 'Frontend Dev',
            reward: 50 * k, // 50, 100, 150
            deliveryDays: k * 2,
            status: 'PENDING'
          }
        });
      }
    }
  }

  // 5. Simulate Activity (Claims & Completions)
  console.log('🚀 Simulating activity...');
  
  // Fetch all tasks
  const allTasks = await prisma.task.findMany();
  // Shuffle tasks
  const shuffledTasks = allTasks.sort(() => 0.5 - Math.random());
  // Take first 15 tasks to complete
  const tasksToComplete = shuffledTasks.slice(0, 15);

  for (const task of tasksToComplete) {
    const contributor = contributors[Math.floor(Math.random() * contributors.length)];
    
    // A. Claim (Assign)
    await prisma.task.update({
      where: { id: task.id },
      data: { 
        assigneeId: contributor.id,
        status: 'ASSIGNED'
      }
    });

    // B. Submit
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: 'SUBMITTED',
        submissionUrl: 'https://github.com/sparkhub/pr/123',
        submissionNotes: 'Done!'
      }
    });

    // C. Approve (Release Funds & Grant XP)
    // Mock Wallet Release logic simulation
    // In real app, WalletService handles this. We just update DB state here.
    
    // XP Calc
    const xp = Math.floor(task.reward * 10);
    
    // Update Task
    await prisma.task.update({
      where: { id: task.id },
      data: { status: 'COMPLETED' }
    });

    // Update Contributor XP & Completed Count
    await prisma.user.update({
      where: { id: contributor.id },
      data: {
        xp: { increment: xp },
        completedTasks: { increment: 1 },
        wallet: {
            update: {
                balance: { increment: task.reward }
            }
        }
      }
    });

    // Check/Award Badge (Rising Contributor) manually for seed
    const hasBadge = await prisma.userBadge.findFirst({
        where: { userId: contributor.id, badge: { code: 'RISING_CONTRIBUTOR' } }
    });
    
    if (!hasBadge) {
        const badge = await prisma.badge.findUnique({ where: { code: 'RISING_CONTRIBUTOR' } });
        if (badge) {
            await prisma.userBadge.create({
                data: { userId: contributor.id, badgeId: badge.id }
            });
        }
    }
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
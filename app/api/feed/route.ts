
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Mock Auth
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Get IDs of users I follow
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);

    // 2. Get IDs of ideas I support (Like)
    const likes = await prisma.like.findMany({
      where: { userId: user.id },
      select: { ideaId: true }
    });
    const likedIdeaIds = likes.map(l => l.ideaId);

    // 3. Fetch Activity

    // A. New Ideas from users I follow
    const ideas = await prisma.idea.findMany({
      where: { authorId: { in: followingIds } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, image: true } } }
    });

    // B. New Tasks on ideas I support
    const tasks = await prisma.task.findMany({
      where: { ideaId: { in: likedIdeaIds } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { 
        idea: { select: { title: true } },
        // Note: Task creator might not be tracked directly if assumed to be idea author, 
        // but assuming system messages here.
      }
    });

    // C. Comments on ideas I support OR by users I follow
    const comments = await prisma.comment.findMany({
      where: {
        OR: [
          { ideaId: { in: likedIdeaIds } },
          { authorId: { in: followingIds } }
        ]
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true, image: true } },
        idea: { select: { title: true, id: true } }
      }
    });

    // 4. Combine and Sort
    const feed = [
      ...ideas.map(i => ({
        type: 'IDEA_CREATE',
        id: i.id,
        date: i.createdAt,
        actor: i.author,
        content: `launched a new idea: "${i.title}"`,
        link: `/ideas/${i.id}`,
        meta: i.category
      })),
      ...tasks.map(t => ({
        type: 'TASK_CREATE',
        id: t.id,
        date: t.createdAt,
        actor: { name: 'Project Update', image: null }, // System message style
        content: `New task added to "${t.idea.title}": ${t.title}`,
        link: `/tasks/${t.id}`,
        meta: `$${t.reward}`
      })),
      ...comments.map(c => ({
        type: 'COMMENT',
        id: c.id,
        date: c.createdAt,
        actor: c.author,
        content: `commented on "${c.idea.title}"`,
        subContent: c.content,
        link: `/ideas/${c.idea.id}`,
        meta: null
      }))
    ];

    // Sort descending
    feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limit total return
    return NextResponse.json(feed.slice(0, 50));

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

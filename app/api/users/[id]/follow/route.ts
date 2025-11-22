
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;

    // Mock Auth
    const currentUser = await prisma.user.findFirst();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.id === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    });

    let isFollowing = false;

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: targetUserId,
          },
        },
      });
      isFollowing = false;
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      });
      isFollowing = true;

      // Optional: Create notification for target user
      await prisma.notification.create({
        data: {
            userId: targetUserId,
            type: 'INFO',
            message: `${currentUser.name || 'Someone'} started following you`,
            link: `/profile` // Ideally to the follower's profile
        }
      });
    }

    return NextResponse.json({ success: true, isFollowing });
  } catch (error: any) {
    console.error('Follow Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

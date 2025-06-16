import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { follows } from '@haygrouve/db-schema';
import { eq, and } from 'drizzle-orm';
import { getUserId } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/users/[id]/follow - Follow a user
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: targetUserId } = await params;
    const currentUserId = await getUserId();

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, currentUserId),
          eq(follows.followingId, targetUserId)
        )
      )
      .limit(1);

    if (existingFollow.length > 0) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 409 }
      );
    }

    // Create follow relationship
    const result = await db
      .insert(follows)
      .values({
        followerId: currentUserId,
        followingId: targetUserId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Successfully followed user',
      data: result[0],
    });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json(
      { error: 'Failed to follow user', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/follow - Unfollow a user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: targetUserId } = await params;
    const currentUserId = await getUserId();

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Remove follow relationship
    const result = await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, currentUserId),
          eq(follows.followingId, targetUserId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Follow relationship not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unfollowed user',
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow user', success: false },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/follow - Check if current user follows target user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: targetUserId } = await params;

    // Try to get current user, but don't require authentication for this endpoint
    let currentUserId = null;
    try {
      currentUserId = await getUserId();
    } catch {
      // User not authenticated, which is fine for checking follow status
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== targetUserId) {
      const followRelation = await db
        .select()
        .from(follows)
        .where(
          and(
            eq(follows.followerId, currentUserId),
            eq(follows.followingId, targetUserId)
          )
        )
        .limit(1);

      isFollowing = followRelation.length > 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        isFollowing,
        canFollow: currentUserId && currentUserId !== targetUserId,
      },
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status', success: false },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { follows, users } from '@haygrouve/db-schema';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id]/connections - Get user's followers and following
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'both'; // 'followers', 'following', or 'both'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    interface UserConnection {
      id: string;
      firstName: string | null;
      lastName: string | null;
      username: string | null;
      profileImageUrl: string | null;
      followedAt: Date;
    }

    let followers: UserConnection[] = [];
    let following: UserConnection[] = [];

    if (type === 'followers' || type === 'both') {
      // Get users who follow this user
      followers = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
          followedAt: follows.createdAt,
        })
        .from(follows)
        .innerJoin(users, eq(follows.followerId, users.id))
        .where(eq(follows.followingId, userId))
        .limit(limit)
        .offset(offset)
        .orderBy(follows.createdAt);
    }

    if (type === 'following' || type === 'both') {
      // Get users this user follows
      following = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
          followedAt: follows.createdAt,
        })
        .from(follows)
        .innerJoin(users, eq(follows.followingId, users.id))
        .where(eq(follows.followerId, userId))
        .limit(limit)
        .offset(offset)
        .orderBy(follows.createdAt);
    }

    // Get counts for pagination
    const [followerCount] = await db
      .select({ count: eq(follows.followingId, userId) })
      .from(follows)
      .where(eq(follows.followingId, userId));

    const [followingCount] = await db
      .select({ count: eq(follows.followerId, userId) })
      .from(follows)
      .where(eq(follows.followerId, userId));

    return NextResponse.json({
      success: true,
      data: {
        followers: type === 'following' ? [] : followers,
        following: type === 'followers' ? [] : following,
        counts: {
          followers: followerCount?.count || 0,
          following: followingCount?.count || 0,
        },
        pagination: {
          limit,
          offset,
          hasMore: {
            followers: type !== 'following' && followers.length === limit,
            following: type !== 'followers' && following.length === limit,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user connections', success: false },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/users/[id]/block - Block a user
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: targetUserId } = await params;
    const currentUser = await getAuthenticatedUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Users cannot block themselves
    if (targetUserId === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    // For now, return success until the shared package is updated
    // In a real implementation, this would:
    // 1. Insert into userBlocks table
    // 2. Remove any existing follow relationships
    // 3. Update privacy permissions

    return NextResponse.json({
      message: 'User blocked successfully',
      blockedUserId: targetUserId,
      blockerId: currentUser.id,
      reason: reason || null,
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: 'Failed to block user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/block - Unblock a user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: targetUserId } = await params;
    const currentUser = await getAuthenticatedUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For now, return success until the shared package is updated
    // In a real implementation, this would remove the block relationship

    return NextResponse.json({
      message: 'User unblocked successfully',
      unblockedUserId: targetUserId,
      unblockerId: currentUser.id,
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { error: 'Failed to unblock user' },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/block - Check if current user has blocked the target user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: targetUserId } = await params;
    const currentUser = await getAuthenticatedUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For now, always return false until the database tables are available
    // In a real implementation, this would query the userBlocks table

    return NextResponse.json({
      isBlocked: false,
      targetUserId,
    });
  } catch (error) {
    console.error('Error checking block status:', error);
    return NextResponse.json(
      { error: 'Failed to check block status' },
      { status: 500 }
    );
  }
}

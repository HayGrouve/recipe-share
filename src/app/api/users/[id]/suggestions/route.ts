import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface FriendSuggestion {
  id: string;
  name: string;
  profileImageUrl?: string;
  mutualFriends?: number;
  score: number;
  reason: string;
}

// GET /api/users/[id]/suggestions - Get friend suggestions for a user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10);

    const currentUser = await getAuthenticatedUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Users can only view their own suggestions
    if (userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Not authorized to view these suggestions' },
        { status: 403 }
      );
    }

    // For now, return mock suggestions until the database tables are available
    // In a real implementation, this would:
    // 1. Query users who aren't already followed
    // 2. Calculate scores based on mutual follows, similar cuisines, etc.
    // 3. Return ordered by relevance score

    const mockSuggestions: FriendSuggestion[] = [
      {
        id: 'mock-user-1',
        name: 'Sarah Johnson',
        profileImageUrl:
          'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face',
        mutualFriends: 3,
        score: 0.95,
        reason: 'mutual_follows',
      },
      {
        id: 'mock-user-2',
        name: 'Mike Chen',
        profileImageUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        mutualFriends: 1,
        score: 0.82,
        reason: 'similar_cuisine',
      },
      {
        id: 'mock-user-3',
        name: 'Emily Rodriguez',
        profileImageUrl:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        mutualFriends: 2,
        score: 0.76,
        reason: 'similar_interests',
      },
    ].slice(0, limit);

    return NextResponse.json({
      suggestions: mockSuggestions,
      userId,
      limit,
      note: 'Friend suggestions are currently showing sample data',
    });
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friend suggestions' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]/suggestions - Dismiss a friend suggestion
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const currentUser = await getAuthenticatedUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Users can only manage their own suggestions
    if (userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Not authorized to manage these suggestions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { suggestedUserId, action } = body;

    if (!suggestedUserId || !action) {
      return NextResponse.json(
        { error: 'Suggested user ID and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'dismiss') {
      return NextResponse.json(
        { error: 'Invalid action. Only "dismiss" is supported' },
        { status: 400 }
      );
    }

    // For now, return success until the database tables are available
    // In a real implementation, this would mark the suggestion as dismissed

    return NextResponse.json({
      message: 'Suggestion dismissed successfully',
      suggestedUserId,
      action,
    });
  } catch (error) {
    console.error('Error managing friend suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to manage friend suggestion' },
      { status: 500 }
    );
  }
}

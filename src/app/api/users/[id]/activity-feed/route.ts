import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get params asynchronously
    const { id } = await params;

    // Check if user is requesting their own activity feed
    const targetUserId = id;
    const isOwnFeed = clerkId === targetUserId;

    if (!isOwnFeed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters for pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // Mock activity feed data until database tables are implemented
    const mockActivities = [
      {
        id: 1,
        type: 'recipe_created',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        user: {
          id: 'user1',
          name: 'Sarah Johnson',
          image:
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        },
        target: {
          id: 'recipe1',
          type: 'recipe',
          title: 'Chocolate Chip Cookies',
        },
        metadata: null,
      },
      {
        id: 2,
        type: 'recipe_rated',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        user: {
          id: 'user2',
          name: 'Mike Chen',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        },
        target: {
          id: 'recipe2',
          type: 'recipe',
          title: 'Homemade Pizza',
        },
        metadata: {
          rating: 5,
          comment: 'Amazing recipe! The crust was perfect.',
        },
      },
      {
        id: 3,
        type: 'recipe_saved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        user: {
          id: 'user3',
          name: 'Emma Wilson',
          image:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        },
        target: {
          id: 'recipe3',
          type: 'recipe',
          title: 'Thai Green Curry',
        },
        metadata: null,
      },
      {
        id: 4,
        type: 'user_followed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        user: {
          id: 'user4',
          name: 'David Brown',
          image:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        },
        target: {
          id: 'user5',
          type: 'user',
          title: 'Lisa Martinez',
        },
        metadata: null,
      },
      {
        id: 5,
        type: 'recipe_commented',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        user: {
          id: 'user5',
          name: 'Lisa Martinez',
          image:
            'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
        },
        target: {
          id: 'recipe4',
          type: 'recipe',
          title: 'Caesar Salad',
        },
        metadata: {
          comment: 'Love the homemade croutons tip!',
        },
      },
    ];

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = mockActivities.slice(startIndex, endIndex);

    const totalPages = Math.ceil(mockActivities.length / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      activities: paginatedActivities,
      pagination: {
        page,
        limit,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}

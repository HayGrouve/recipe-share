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

    // Check if user is requesting their own notifications
    const targetUserId = id;
    const isOwnNotifications = clerkId === targetUserId;

    if (!isOwnNotifications) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    // Mock notifications data until database tables are implemented
    const mockNotifications = [
      {
        id: 1,
        type: 'new_follower',
        title: 'New Follower',
        message: 'Sarah Johnson started following you',
        isRead: false,
        actionUrl: '/profile/sarah-johnson',
        triggerUser: {
          id: 'user1',
          name: 'Sarah Johnson',
          image:
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        },
        target: {
          id: clerkId,
          type: 'user',
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        id: 2,
        type: 'recipe_comment',
        title: 'New Comment',
        message: 'Mike Chen commented on your recipe "Chocolate Chip Cookies"',
        isRead: false,
        actionUrl: '/recipes/recipe1#comments',
        triggerUser: {
          id: 'user2',
          name: 'Mike Chen',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        },
        target: {
          id: 'recipe1',
          type: 'recipe',
          title: 'Chocolate Chip Cookies',
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: 3,
        type: 'recipe_rating',
        title: 'New Rating',
        message: 'Emma Wilson rated your recipe "Homemade Pizza" 5 stars',
        isRead: true,
        actionUrl: '/recipes/recipe2',
        triggerUser: {
          id: 'user3',
          name: 'Emma Wilson',
          image:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        },
        target: {
          id: 'recipe2',
          type: 'recipe',
          title: 'Homemade Pizza',
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      },
      {
        id: 4,
        type: 'friend_activity',
        title: 'Friend Activity',
        message: 'David Brown created a new recipe "Thai Green Curry"',
        isRead: true,
        actionUrl: '/recipes/recipe3',
        triggerUser: {
          id: 'user4',
          name: 'David Brown',
          image:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        },
        target: {
          id: 'recipe3',
          type: 'recipe',
          title: 'Thai Green Curry',
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      },
    ];

    // Filter notifications based on unreadOnly parameter
    let filteredNotifications = mockNotifications;
    if (unreadOnly) {
      filteredNotifications = mockNotifications.filter((n) => !n.isRead);
    }

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(
      startIndex,
      endIndex
    );

    const totalPages = Math.ceil(filteredNotifications.length / limit);
    const hasMore = page < totalPages;
    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        totalPages,
        hasMore,
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Check if user is updating their own notifications
    const targetUserId = id;
    const isOwnNotifications = clerkId === targetUserId;

    if (!isOwnNotifications) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { notificationId, action } = body;

    if (!notificationId || !action) {
      return NextResponse.json(
        { error: 'notificationId and action are required' },
        { status: 400 }
      );
    }

    // Mock update operation
    if (action === 'mark_read') {
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
        notificationId,
      });
    }

    if (action === 'mark_all_read') {
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if user is deleting their own notifications
    const targetUserId = id;
    const isOwnNotifications = clerkId === targetUserId;

    if (!isOwnNotifications) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' },
        { status: 400 }
      );
    }

    // Mock delete operation
    return NextResponse.json({
      success: true,
      message: 'Notification deleted',
      notificationId,
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}

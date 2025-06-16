import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/recipes/[id]/comments - Get recipe comments
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);

    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Parse pagination parameters
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // Mock comments data since we're avoiding database type issues for now
    const mockComments = [
      {
        id: '1',
        content:
          'This recipe is amazing! Made it for my family and everyone loved it.',
        rating: 5,
        author: {
          id: 'user1',
          name: 'Sarah Johnson',
          image: 'https://api.dicebear.com/7.x/avatars/svg?seed=sarah',
        },
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        content:
          'Great recipe! I substituted honey for sugar and it turned out perfect.',
        rating: 4,
        author: {
          id: 'user2',
          name: 'Mike Chen',
          image: 'https://api.dicebear.com/7.x/avatars/svg?seed=mike',
        },
        createdAt: '2024-01-14T15:45:00Z',
        updatedAt: '2024-01-14T15:45:00Z',
      },
      {
        id: '3',
        content:
          'Easy to follow instructions. Will definitely make this again!',
        rating: 5,
        author: {
          id: 'user3',
          name: 'Emily Davis',
          image: 'https://api.dicebear.com/7.x/avatars/svg?seed=emily',
        },
        createdAt: '2024-01-13T20:15:00Z',
        updatedAt: '2024-01-13T20:15:00Z',
      },
    ];

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = mockComments.slice(startIndex, endIndex);

    return NextResponse.json({
      comments: paginatedComments,
      pagination: {
        page,
        limit,
        totalCount: mockComments.length,
        totalPages: Math.ceil(mockComments.length / limit),
        hasNextPage: endIndex < mockComments.length,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/recipes/[id]/comments - Add comment
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { content, rating } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (
      rating !== undefined &&
      (typeof rating !== 'number' || rating < 1 || rating > 5)
    ) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    // Mock new comment response
    const mockNewComment = {
      id: `${Date.now()}`,
      content: content.trim(),
      rating: rating || null,
      author: {
        id: user.id,
        name: user.firstName || 'Anonymous User',
        image:
          user.imageUrl ||
          `https://api.dicebear.com/7.x/avatars/svg?seed=${user.id}`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        comment: mockNewComment,
        message: 'Comment added successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

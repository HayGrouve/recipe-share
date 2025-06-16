import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments } from '@haygrouve/db-schema';
import { eq, desc } from 'drizzle-orm';
import { getUserId } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/recipes/[id]/comments - Get recipe comments
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: recipeId } = await params;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Get comments for the recipe
    const recipeComments = await db
      .select()
      .from(comments)
      .where(eq(comments.recipeId, recipeId))
      .orderBy(desc(comments.createdAt));

    // Format comments with user info (using Clerk user ID)
    const formattedComments = recipeComments.map((comment) => ({
      id: comment.id,
      content: comment.text,
      createdAt: comment.createdAt,
      userId: comment.userId,
      author: {
        id: comment.userId,
        name: `User ${comment.userId.slice(-4)}`, // Placeholder name
        avatar: null, // Will be filled by client-side Clerk data
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        comments: formattedComments,
        total: recipeComments.length,
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', success: false },
      { status: 500 }
    );
  }
}

// POST /api/recipes/[id]/comments - Submit a new comment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: recipeId } = await params;
    const userId = await getUserId();

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content } = body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be less than 1000 characters' },
        { status: 400 }
      );
    }

    // Create new comment
    const result = await db
      .insert(comments)
      .values({
        recipeId,
        userId,
        text: content.trim(),
      })
      .returning();

    const newComment = result[0];

    return NextResponse.json({
      success: true,
      message: 'Comment submitted successfully',
      data: {
        id: newComment.id,
        content: newComment.text,
        createdAt: newComment.createdAt,
        userId: newComment.userId,
        author: {
          id: newComment.userId,
          name: `User ${newComment.userId.slice(-4)}`, // Placeholder name
          avatar: null,
        },
      },
    });
  } catch (error) {
    console.error('Error submitting comment:', error);
    return NextResponse.json(
      { error: 'Failed to submit comment', success: false },
      { status: 500 }
    );
  }
}

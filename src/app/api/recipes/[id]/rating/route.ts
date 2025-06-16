import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ratings } from '@haygrouve/db-schema';
import { eq, avg, count, and } from 'drizzle-orm';
import { getUserId } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/recipes/[id]/rating - Get recipe ratings and user's rating
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: recipeId } = await params;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Get aggregated rating data
    const ratingStats = await db
      .select({
        averageRating: avg(ratings.rating),
        totalRatings: count(ratings.id),
      })
      .from(ratings)
      .where(eq(ratings.recipeId, recipeId));

    const stats = ratingStats[0] || { averageRating: 0, totalRatings: 0 };

    // Get rating distribution (1-5 stars)
    const distribution = await Promise.all([
      db
        .select({ count: count() })
        .from(ratings)
        .where(and(eq(ratings.recipeId, recipeId), eq(ratings.rating, 1)))
        .then((r) => r[0]?.count || 0),
      db
        .select({ count: count() })
        .from(ratings)
        .where(and(eq(ratings.recipeId, recipeId), eq(ratings.rating, 2)))
        .then((r) => r[0]?.count || 0),
      db
        .select({ count: count() })
        .from(ratings)
        .where(and(eq(ratings.recipeId, recipeId), eq(ratings.rating, 3)))
        .then((r) => r[0]?.count || 0),
      db
        .select({ count: count() })
        .from(ratings)
        .where(and(eq(ratings.recipeId, recipeId), eq(ratings.rating, 4)))
        .then((r) => r[0]?.count || 0),
      db
        .select({ count: count() })
        .from(ratings)
        .where(and(eq(ratings.recipeId, recipeId), eq(ratings.rating, 5)))
        .then((r) => r[0]?.count || 0),
    ]);

    // Try to get current user's rating (if authenticated)
    let userRating = null;
    try {
      const userId = await getUserId();
      if (userId) {
        const userRatingResult = await db
          .select()
          .from(ratings)
          .where(
            and(eq(ratings.recipeId, recipeId), eq(ratings.userId, userId))
          )
          .limit(1);

        userRating = userRatingResult[0] || null;
      }
    } catch {
      // User not authenticated, which is fine
    }

    return NextResponse.json({
      success: true,
      data: {
        averageRating: Number(stats.averageRating) || 0,
        totalRatings: stats.totalRatings || 0,
        distribution: {
          1: distribution[0],
          2: distribution[1],
          3: distribution[2],
          4: distribution[3],
          5: distribution[4],
        },
        userRating: userRating
          ? {
              rating: userRating.rating,
              comment: userRating.comment,
              createdAt: userRating.createdAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching recipe ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe ratings', success: false },
      { status: 500 }
    );
  }
}

// POST /api/recipes/[id]/rating - Submit or update a rating
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
    const { rating, comment } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user already rated this recipe
    const existingRating = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.recipeId, recipeId), eq(ratings.userId, userId)))
      .limit(1);

    let result;
    if (existingRating.length > 0) {
      // Update existing rating
      result = await db
        .update(ratings)
        .set({
          rating,
          comment: comment || null,
        })
        .where(and(eq(ratings.recipeId, recipeId), eq(ratings.userId, userId)))
        .returning();
    } else {
      // Create new rating
      result = await db
        .insert(ratings)
        .values({
          recipeId,
          userId,
          rating,
          comment: comment || null,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      message:
        existingRating.length > 0
          ? 'Rating updated successfully'
          : 'Rating submitted successfully',
      data: result[0],
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating', success: false },
      { status: 500 }
    );
  }
}

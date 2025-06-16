import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { recipes } from '@haygrouve/db-schema';
import { eq } from 'drizzle-orm';
import type { AsyncRecipeRouteParams } from '@haygrouve/db-schema';

export async function GET(request: Request, context: AsyncRecipeRouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const recipeId = params.id;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Verify recipe ownership
    const recipe = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1);

    if (!recipe.length || recipe[0].userId !== userId) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // For now, return placeholder analytics since the schema fields need to be verified
    // TODO: Implement actual analytics queries once schema is confirmed

    // Placeholder analytics based on available data
    const ratingStats = [{ averageRating: 0, totalRatings: 0 }];
    const recentRatings: Array<{
      rating: number;
      review: string | null;
      createdAt: string;
      userId: string;
    }> = [];
    const commentsStats = [{ totalComments: 0 }];
    const savesStats = [{ totalSaves: 0 }];
    const recentActivity: Array<{
      type: string;
      content: string;
      createdAt: string;
      userId: string;
    }> = [];

    const analytics = {
      recipeId,
      ratings: {
        average: ratingStats[0]?.averageRating
          ? Number(ratingStats[0].averageRating)
          : 0,
        total: ratingStats[0]?.totalRatings || 0,
        history: recentRatings.map((r) => ({
          rating: r.rating,
          review: r.review,
          createdAt: r.createdAt,
          userId: r.userId,
        })),
      },
      engagement: {
        totalComments: commentsStats[0]?.totalComments || 0,
        totalSaves: savesStats[0]?.totalSaves || 0,
        viewCount: 0, // TODO: Implement view tracking
      },
      recentActivity: recentActivity.map((a) => ({
        type: 'comment',
        content: a.content,
        createdAt: a.createdAt,
        userId: a.userId,
      })),
      performance: {
        engagementRate: 0, // TODO: Calculate when view tracking is available
        averageRating: ratingStats[0]?.averageRating
          ? Number(ratingStats[0].averageRating)
          : 0,
        saveRate: 0, // TODO: Calculate when view tracking is available
      },
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching recipe analytics:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { recipes } from '@haygrouve/db-schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all user's recipes
    const userRecipes = await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId))
      .orderBy(desc(recipes.createdAt));

    // Calculate comprehensive statistics
    const totalRecipes = userRecipes.length;
    const publishedRecipes = userRecipes.filter((r) => r.isPublished).length;
    const draftRecipes = userRecipes.filter((r) => !r.isPublished).length;

    // Get recipes by timeframe
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recipesLast30Days = userRecipes.filter(
      (r) => r.createdAt && new Date(r.createdAt) >= thirtyDaysAgo
    ).length;

    const recipesLast7Days = userRecipes.filter(
      (r) => r.createdAt && new Date(r.createdAt) >= sevenDaysAgo
    ).length;

    // Most recent recipes
    const recentRecipes = userRecipes.slice(0, 5).map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      isPublished: recipe.isPublished,
      createdAt: recipe.createdAt?.toISOString(),
      // Placeholder analytics - will be real data when analytics tables are ready
      viewCount: 0,
      ratingCount: 0,
      saveCount: 0,
    }));

    // Performance metrics (placeholders for now)
    const analytics = {
      overview: {
        totalRecipes,
        publishedRecipes,
        draftRecipes,
        recipesLast30Days,
        recipesLast7Days,
      },
      engagement: {
        totalViews: 0, // TODO: Sum from view tracking
        totalRatings: 0, // TODO: Count from ratings table
        totalComments: 0, // TODO: Count from comments table
        totalSaves: 0, // TODO: Count from savedRecipes table
        averageRating: 0, // TODO: Calculate from ratings table
      },
      performance: {
        topPerformingRecipes: [], // TODO: Top recipes by views/engagement
        engagementRate: 0, // TODO: Calculate engagement metrics
        growthRate: 0, // TODO: Calculate growth metrics
      },
      recentActivity: {
        recentRecipes,
        recentEngagement: [], // TODO: Recent comments, ratings, saves
      },
      trends: {
        viewsOverTime: [], // TODO: View trends over time
        ratingsOverTime: [], // TODO: Rating trends over time
        recipeCreationOverTime: userRecipes.reduce(
          (acc, recipe) => {
            if (recipe.createdAt) {
              const month = new Date(recipe.createdAt)
                .toISOString()
                .slice(0, 7);
              acc[month] = (acc[month] || 0) + 1;
            }
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}

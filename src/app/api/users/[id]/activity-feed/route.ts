import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { follows, users, recipes, ratings } from '@haygrouve/db-schema';
import { eq, desc, inArray } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ActivityItem {
  id: string;
  type: 'recipe_created' | 'recipe_rated';
  userId: string;
  userName: string;
  userImage: string | null;
  createdAt: Date;
  recipe?: {
    id: string;
    title: string;
    description: string | null;
  };
  rating?: {
    value: number;
    comment: string | null;
  };
}

// GET /api/users/[id]/activity-feed - Get activity feed for user's connections
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get users that this user follows
    const followingUsers = await db
      .select({ userId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    if (followingUsers.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          activities: [],
          hasMore: false,
        },
      });
    }

    const followingUserIds = followingUsers.map((f) => f.userId);

    // Get recent recipes from followed users
    const recentRecipes = await db
      .select({
        id: recipes.id,
        title: recipes.title,
        description: recipes.description,
        userId: recipes.userId,
        createdAt: recipes.createdAt,
        userName: users.firstName,
        userLastName: users.lastName,
        userImage: users.profileImageUrl,
      })
      .from(recipes)
      .innerJoin(users, eq(recipes.userId, users.id))
      .where(inArray(recipes.userId, followingUserIds))
      .orderBy(desc(recipes.createdAt))
      .limit(limit)
      .offset(offset);

    // Get recent ratings from followed users
    const recentRatings = await db
      .select({
        id: ratings.id,
        value: ratings.rating,
        comment: ratings.comment,
        userId: ratings.userId,
        recipeId: ratings.recipeId,
        createdAt: ratings.createdAt,
        userName: users.firstName,
        userLastName: users.lastName,
        userImage: users.profileImageUrl,
        recipeTitle: recipes.title,
        recipeDescription: recipes.description,
      })
      .from(ratings)
      .innerJoin(users, eq(ratings.userId, users.id))
      .innerJoin(recipes, eq(ratings.recipeId, recipes.id))
      .where(inArray(ratings.userId, followingUserIds))
      .orderBy(desc(ratings.createdAt))
      .limit(limit)
      .offset(offset);

    // Combine and sort activities
    const activities: ActivityItem[] = [];

    // Add recipe activities
    recentRecipes.forEach((recipe) => {
      activities.push({
        id: `recipe_${recipe.id}`,
        type: 'recipe_created',
        userId: recipe.userId,
        userName:
          `${recipe.userName || ''} ${recipe.userLastName || ''}`.trim(),
        userImage: recipe.userImage,
        createdAt: recipe.createdAt,
        recipe: {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
        },
      });
    });

    // Add rating activities
    recentRatings.forEach((rating) => {
      activities.push({
        id: `rating_${rating.id}`,
        type: 'recipe_rated',
        userId: rating.userId,
        userName:
          `${rating.userName || ''} ${rating.userLastName || ''}`.trim(),
        userImage: rating.userImage,
        createdAt: rating.createdAt,
        recipe: {
          id: rating.recipeId,
          title: rating.recipeTitle,
          description: rating.recipeDescription,
        },
        rating: {
          value: rating.value,
          comment: rating.comment,
        },
      });
    });

    // Sort by creation date (newest first)
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Take only the requested number of activities
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        activities: limitedActivities,
        hasMore: activities.length > limit,
        followingCount: followingUserIds.length,
      },
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed', success: false },
      { status: 500 }
    );
  }
}

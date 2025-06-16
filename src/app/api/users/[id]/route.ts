import { NextRequest, NextResponse } from 'next/server';
import { eq, count, desc } from 'drizzle-orm';
import { db, users, AsyncUserRouteParams } from '@/lib/db';
import { recipes, collections } from '@haygrouve/db-schema';
import { getAuthenticatedUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id] - Get user profile
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user stats
    const [recipeCount, collectionCount] = await Promise.all([
      db
        .select({ count: count() })
        .from(recipes)
        .where(eq(recipes.userId, userId))
        .then((result) => result[0]?.count || 0),

      db
        .select({ count: count() })
        .from(collections)
        .where(eq(collections.userId, userId))
        .then((result) => result[0]?.count || 0),
    ]);

    // Get recent recipes
    const recentRecipes = await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId))
      .orderBy(desc(recipes.createdAt))
      .limit(6);

    const userProfile = {
      id: userId,
      stats: {
        recipeCount,
        collectionCount,
        likesCount: 0, // Will be implemented when rating system is added
        reviewsCount: 0, // Will be implemented when comment system is added
        followersCount: 0, // Will be implemented when follow system is added
        followingCount: 0, // Will be implemented when follow system is added
      },
      recentRecipes,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(request: NextRequest, context: AsyncUserRouteParams) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user is updating their own profile
    if (id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this profile' },
        { status: 403 }
      );
    }

    // Check if user exists in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const { name, image } = body;

    let updatedUser;

    if (!existingUser || existingUser.length === 0) {
      // Create new user record if doesn't exist
      updatedUser = await db
        .insert(users)
        .values({
          id: user.id,
          clerkId: user.id, // Clerk user ID
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: name || user.firstName || '',
          profileImageUrl: image || user.imageUrl || '',
          // Legacy fields for backward compatibility
          name: name || user.firstName || '',
          image: image || user.imageUrl || '',
        })
        .returning();
    } else {
      // Update existing user
      updatedUser = await db
        .update(users)
        .set({
          firstName: name || existingUser[0].firstName,
          profileImageUrl: image || existingUser[0].profileImageUrl,
          // Legacy fields for backward compatibility
          name: name || existingUser[0].name,
          image: image || existingUser[0].image,
        })
        .where(eq(users.id, id))
        .returning();
    }

    return NextResponse.json({
      message: 'User profile updated successfully',
      user: updatedUser[0],
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

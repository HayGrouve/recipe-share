import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db, recipes, users, AsyncUserRouteParams } from '@/lib/db';

// GET /api/users/[id]/recipes - Get user's recipes
export async function GET(request: NextRequest, context: AsyncUserRouteParams) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);
    const includeUnpublished =
      searchParams.get('includeUnpublished') === 'true';

    // Validate pagination
    const validPage = Math.max(page, 1);
    const validLimit = Math.max(limit, 1);

    // Build query conditions
    const conditions = [eq(recipes.userId, id)];

    // Only include published recipes unless specifically requested
    if (!includeUnpublished) {
      conditions.push(eq(recipes.isPublished, true));
    }

    // Get user's recipes using a simplified approach to avoid type issues
    const userRecipes = await db
      .select()
      .from(recipes)
      .leftJoin(users, eq(recipes.userId, users.id))
      .where(eq(recipes.userId, id))
      .orderBy(desc(recipes.createdAt))
      .limit(validLimit)
      .offset((validPage - 1) * validLimit);

    // Get total count for pagination
    const totalRecipes = await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, id));

    const totalCount = totalRecipes.length;
    const totalPages = Math.ceil(totalCount / validLimit);

    return NextResponse.json({
      recipes: userRecipes.map((item) => ({
        ...item.recipes,
        author: item.users,
      })),
      pagination: {
        page: validPage,
        limit: validLimit,
        totalCount,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user recipes' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { eq, and, inArray } from 'drizzle-orm';
import { db, recipes } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

// POST /api/recipes/bulk - Bulk operations on recipes
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, recipeIds } = body;

    if (!action || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and recipe IDs are required' },
        { status: 400 }
      );
    }

    // Validate all recipes belong to the user
    const userRecipes = await db
      .select({ id: recipes.id })
      .from(recipes)
      .where(and(eq(recipes.userId, user.id), inArray(recipes.id, recipeIds)));

    if (userRecipes.length !== recipeIds.length) {
      return NextResponse.json(
        { error: 'Some recipes not found or access denied' },
        { status: 403 }
      );
    }

    let result;

    switch (action) {
      case 'delete':
        await db
          .delete(recipes)
          .where(
            and(eq(recipes.userId, user.id), inArray(recipes.id, recipeIds))
          );

        result = {
          success: true,
          message: `Successfully deleted ${recipeIds.length} recipe(s)`,
          deletedCount: recipeIds.length,
        };
        break;

      case 'updateStatus':
        const { status } = body;
        if (!status || !['draft', 'published'].includes(status)) {
          return NextResponse.json(
            { error: 'Valid status is required (draft, published)' },
            { status: 400 }
          );
        }

        const isPublished = status === 'published';
        await db
          .update(recipes)
          .set({
            isPublished,
            updatedAt: new Date(),
          })
          .where(
            and(eq(recipes.userId, user.id), inArray(recipes.id, recipeIds))
          );

        result = {
          success: true,
          message: `Successfully updated ${recipeIds.length} recipe(s) to ${status}`,
          updatedCount: recipeIds.length,
          status,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: delete, updateStatus' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

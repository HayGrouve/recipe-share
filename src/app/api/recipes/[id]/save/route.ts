import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { savedRecipes } from '@haygrouve/db-schema';
import { eq, and } from 'drizzle-orm';
import { getUserId } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/recipes/[id]/save - Save a recipe
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: recipeId } = await params;
    const currentUserId = await getUserId();

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check if already saved
    const existingSave = await db
      .select()
      .from(savedRecipes)
      .where(
        and(
          eq(savedRecipes.userId, currentUserId),
          eq(savedRecipes.recipeId, recipeId)
        )
      )
      .limit(1);

    if (existingSave.length > 0) {
      return NextResponse.json(
        { error: 'Recipe already saved' },
        { status: 409 }
      );
    }

    // Save the recipe
    const result = await db
      .insert(savedRecipes)
      .values({
        userId: currentUserId,
        recipeId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Recipe saved successfully',
      data: result[0],
    });
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json(
      { error: 'Failed to save recipe', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id]/save - Unsave a recipe
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: recipeId } = await params;
    const currentUserId = await getUserId();

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Remove saved recipe
    const result = await db
      .delete(savedRecipes)
      .where(
        and(
          eq(savedRecipes.userId, currentUserId),
          eq(savedRecipes.recipeId, recipeId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Recipe not found in saved recipes' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Recipe removed from saved recipes',
    });
  } catch (error) {
    console.error('Error unsaving recipe:', error);
    return NextResponse.json(
      { error: 'Failed to unsave recipe', success: false },
      { status: 500 }
    );
  }
}

// GET /api/recipes/[id]/save - Check if recipe is saved by current user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: recipeId } = await params;

    // Try to get current user, but don't require authentication
    let currentUserId = null;
    try {
      currentUserId = await getUserId();
    } catch {
      // User not authenticated
    }

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    let isSaved = false;
    if (currentUserId) {
      const savedRecipe = await db
        .select()
        .from(savedRecipes)
        .where(
          and(
            eq(savedRecipes.userId, currentUserId),
            eq(savedRecipes.recipeId, recipeId)
          )
        )
        .limit(1);

      isSaved = savedRecipe.length > 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        isSaved,
        canSave: !!currentUserId,
      },
    });
  } catch (error) {
    console.error('Error checking save status:', error);
    return NextResponse.json(
      { error: 'Failed to check save status', success: false },
      { status: 500 }
    );
  }
}

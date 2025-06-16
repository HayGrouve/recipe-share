import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, recipes, users, AsyncRecipeRouteParams } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/recipes/[id] - Get single recipe
export async function GET(
  request: NextRequest,
  context: AsyncRecipeRouteParams
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Get recipe with author info
    const recipe = await db
      .select()
      .from(recipes)
      .leftJoin(users, eq(recipes.userId, users.id))
      .where(eq(recipes.id, id))
      .limit(1);

    if (!recipe || recipe.length === 0) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const [recipeData] = recipe;

    // Check if recipe is published or user owns it
    const currentUser = await getAuthenticatedUser().catch(() => null);
    const isOwner = currentUser && currentUser.id === recipeData.recipes.userId;

    if (!recipeData.recipes.isPublished && !isOwner) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json({
      recipe: {
        ...recipeData.recipes,
        author: recipeData.users,
      },
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// PUT /api/recipes/[id] - Update recipe
export async function PUT(
  request: NextRequest,
  context: AsyncRecipeRouteParams
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
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check if recipe exists and user owns it
    const existingRecipe = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, id))
      .limit(1);

    if (!existingRecipe || existingRecipe.length === 0) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (existingRecipe[0].userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this recipe' },
        { status: 403 }
      );
    }

    // Update the recipe
    const {
      title,
      description,
      instructions,
      prepTime,
      cookTime,
      servings,
      isPublished,
    } = body;

    const updatedRecipe = await db
      .update(recipes)
      .set({
        title: title || existingRecipe[0].title,
        description: description || existingRecipe[0].description,
        instructions: instructions || existingRecipe[0].instructions,
        prepTime: prepTime ?? existingRecipe[0].prepTime,
        cookTime: cookTime ?? existingRecipe[0].cookTime,
        servings: servings ?? existingRecipe[0].servings,
        isPublished: isPublished ?? existingRecipe[0].isPublished,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, id))
      .returning();

    return NextResponse.json({
      message: 'Recipe updated successfully',
      recipe: updatedRecipe[0],
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id] - Delete recipe
export async function DELETE(
  request: NextRequest,
  context: AsyncRecipeRouteParams
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

    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check if recipe exists and user owns it
    const existingRecipe = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, id))
      .limit(1);

    if (!existingRecipe || existingRecipe.length === 0) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (existingRecipe[0].userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this recipe' },
        { status: 403 }
      );
    }

    // Delete the recipe
    await db.delete(recipes).where(eq(recipes.id, id));

    return NextResponse.json({
      message: 'Recipe deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}

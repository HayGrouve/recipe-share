import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { savedRecipes, recipes, users } from '@haygrouve/db-schema';
import { eq, desc } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id]/saved-recipes - Get user's saved recipes
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get saved recipes with recipe details
    const userSavedRecipes = await db
      .select({
        id: recipes.id,
        title: recipes.title,
        description: recipes.description,
        prepTime: recipes.prepTime,
        cookTime: recipes.cookTime,
        servings: recipes.servings,
        isPublished: recipes.isPublished,
        createdAt: recipes.createdAt,
        updatedAt: recipes.updatedAt,
        savedAt: savedRecipes.savedAt,
        authorId: users.id,
        authorName: users.firstName,
        authorLastName: users.lastName,
        authorUsername: users.username,
        authorImage: users.profileImageUrl,
      })
      .from(savedRecipes)
      .innerJoin(recipes, eq(savedRecipes.recipeId, recipes.id))
      .innerJoin(users, eq(recipes.userId, users.id))
      .where(eq(savedRecipes.userId, userId))
      .orderBy(desc(savedRecipes.savedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: savedRecipes.userId })
      .from(savedRecipes)
      .where(eq(savedRecipes.userId, userId));

    const totalCount = totalCountResult.length;

    // Format the response
    const formattedRecipes = userSavedRecipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      isPublished: recipe.isPublished,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      savedAt: recipe.savedAt,
      author: {
        id: recipe.authorId,
        name:
          `${recipe.authorName || ''} ${recipe.authorLastName || ''}`.trim() ||
          recipe.authorUsername ||
          'Anonymous',
        username: recipe.authorUsername,
        image: recipe.authorImage,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        recipes: formattedRecipes,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved recipes', success: false },
      { status: 500 }
    );
  }
}

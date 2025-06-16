import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db, collections, collectionRecipes, recipes } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/collections/[id]/recipes - Add recipe to collection
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: collectionId } = await params;
    const body = await request.json();
    const { recipeId } = body;

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check if collection exists and user owns it
    const collection = await db
      .select()
      .from(collections)
      .where(eq(collections.id, collectionId))
      .limit(1);

    if (!collection || collection.length === 0) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (collection[0].userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if recipe exists and user has access to it
    const recipe = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1);

    if (!recipe || recipe.length === 0) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Check if recipe is already in collection
    const existingEntry = await db
      .select()
      .from(collectionRecipes)
      .where(
        and(
          eq(collectionRecipes.collectionId, collectionId),
          eq(collectionRecipes.recipeId, recipeId)
        )
      )
      .limit(1);

    if (existingEntry && existingEntry.length > 0) {
      return NextResponse.json(
        { error: 'Recipe is already in this collection' },
        { status: 409 }
      );
    }

    // Add recipe to collection
    await db.insert(collectionRecipes).values({
      collectionId,
      recipeId,
    });

    return NextResponse.json({
      success: true,
      message: 'Recipe added to collection successfully',
    });
  } catch (error) {
    console.error('Error adding recipe to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add recipe to collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id]/recipes - Remove recipe from collection
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: collectionId } = await params;
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check if collection exists and user owns it
    const collection = await db
      .select()
      .from(collections)
      .where(eq(collections.id, collectionId))
      .limit(1);

    if (!collection || collection.length === 0) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (collection[0].userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if recipe is in collection
    const existingEntry = await db
      .select()
      .from(collectionRecipes)
      .where(
        and(
          eq(collectionRecipes.collectionId, collectionId),
          eq(collectionRecipes.recipeId, recipeId)
        )
      )
      .limit(1);

    if (!existingEntry || existingEntry.length === 0) {
      return NextResponse.json(
        { error: 'Recipe not found in this collection' },
        { status: 404 }
      );
    }

    // Remove recipe from collection
    await db
      .delete(collectionRecipes)
      .where(
        and(
          eq(collectionRecipes.collectionId, collectionId),
          eq(collectionRecipes.recipeId, recipeId)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Recipe removed from collection successfully',
    });
  } catch (error) {
    console.error('Error removing recipe from collection:', error);
    return NextResponse.json(
      { error: 'Failed to remove recipe from collection' },
      { status: 500 }
    );
  }
}

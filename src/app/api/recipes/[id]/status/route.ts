import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, recipes } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/recipes/[id]/status - Update recipe status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['draft', 'published'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (draft, published)' },
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
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the recipe status (map status to isPublished)
    const isPublished = status === 'published';
    const [updatedRecipe] = await db
      .update(recipes)
      .set({
        isPublished,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      recipe: {
        id: updatedRecipe.id,
        status: updatedRecipe.isPublished ? 'published' : 'draft',
        updatedAt: updatedRecipe.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating recipe status:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe status' },
      { status: 500 }
    );
  }
}

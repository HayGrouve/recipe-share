import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, collections } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/collections/[id] - Get specific collection
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    // Get the collection
    const collection = await db
      .select()
      .from(collections)
      .where(eq(collections.id, id))
      .limit(1);

    if (!collection || collection.length === 0) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    const [collectionData] = collection;

    // Check if user owns the collection
    if (collectionData.userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      collection: {
        ...collectionData,
        recipeCount: 0, // TODO: Add recipe count calculation
        coverImage: null, // TODO: Add cover image from first recipe
      },
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// PUT /api/collections/[id] - Update collection
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
    const { name, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Collection name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Check if collection exists and user owns it
    const existingCollection = await db
      .select()
      .from(collections)
      .where(eq(collections.id, id))
      .limit(1);

    if (!existingCollection || existingCollection.length === 0) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (existingCollection[0].userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the collection
    const [updatedCollection] = await db
      .update(collections)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .where(eq(collections.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      collection: {
        ...updatedCollection,
        recipeCount: 0, // TODO: Add recipe count calculation
        coverImage: null, // TODO: Add cover image from first recipe
      },
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id] - Delete collection
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    // Check if collection exists and user owns it
    const existingCollection = await db
      .select()
      .from(collections)
      .where(eq(collections.id, id))
      .limit(1);

    if (!existingCollection || existingCollection.length === 0) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (existingCollection[0].userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete the collection (cascade will handle collection_recipes)
    await db.delete(collections).where(eq(collections.id, id));

    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}

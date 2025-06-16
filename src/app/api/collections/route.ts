import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db, collections } from '@/lib/db';
import { getUserId } from '@/lib/auth';

// GET /api/collections - Get user's collections
export async function GET() {
  try {
    // Get user's Clerk ID for querying collections
    const userId = await getUserId();

    // Get user's collections using Clerk ID directly
    const userCollections = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(desc(collections.createdAt));

    // Format collections for frontend (simplified for now)
    const formattedCollections = userCollections.map((collection) => ({
      ...collection,
      recipeCount: 0, // TODO: Add recipe count calculation
      coverImage: null, // TODO: Add cover image from first recipe
    }));

    return NextResponse.json({
      success: true,
      collections: formattedCollections,
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST /api/collections - Create new collection
export async function POST(request: NextRequest) {
  try {
    // Get user's Clerk ID for collection creation
    const userId = await getUserId();

    const body = await request.json();
    const { name, description } = body;

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

    // Create the collection
    const [newCollection] = await db
      .insert(collections)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        userId: userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      collection: {
        ...newCollection,
        recipeCount: 0,
        coverImage: null,
      },
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}

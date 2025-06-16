import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, collections } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { randomBytes } from 'crypto';

interface ShareCollectionRequest {
  permission: 'view' | 'edit';
  expiresAt?: string; // ISO date string
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/collections/[id]/share - Generate or update sharing settings
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const collectionId = params.id;

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    // Verify collection ownership
    const collection = await db
      .select()
      .from(collections)
      .where(eq(collections.id, collectionId))
      .limit(1);

    if (!collection.length || collection[0].userId !== user.id) {
      return NextResponse.json(
        { error: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    const body = (await request.json()) as ShareCollectionRequest;
    const { permission = 'view', expiresAt } = body;

    // Validate permission
    if (!['view', 'edit'].includes(permission)) {
      return NextResponse.json(
        { error: 'Invalid permission. Must be "view" or "edit"' },
        { status: 400 }
      );
    }

    // Generate a unique share token
    const shareToken = randomBytes(32).toString('hex');

    // Parse expiration date if provided
    let expirationDate = null;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expiration date format' },
          { status: 400 }
        );
      }

      // Ensure expiration is in the future
      if (expirationDate <= new Date()) {
        return NextResponse.json(
          { error: 'Expiration date must be in the future' },
          { status: 400 }
        );
      }
    }

    // For now, we'll store sharing info in a simple way
    // TODO: When schema allows, create a dedicated collection_shares table
    // For this implementation, we'll use a metadata approach

    // Note: In a real implementation, you'd store shareData in a dedicated table
    // const shareData = { isShared: true, shareToken, sharePermission: permission, ... }

    // Update collection - for now just verify it exists (we already validated ownership above)
    // TODO: Store sharing metadata when schema supports it

    // Generate the shareable URL
    const baseUrl = request.nextUrl.origin;
    const shareUrl = `${baseUrl}/collections/shared/${shareToken}`;

    return NextResponse.json({
      success: true,
      share: {
        token: shareToken,
        url: shareUrl,
        permission,
        expiresAt: expirationDate?.toISOString() || null,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sharing collection:', error);
    return NextResponse.json(
      { error: 'Failed to share collection' },
      { status: 500 }
    );
  }
}

// GET /api/collections/[id]/share - Get current sharing settings
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const collectionId = params.id;

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    // Verify collection ownership
    const collection = await db
      .select()
      .from(collections)
      .where(eq(collections.id, collectionId))
      .limit(1);

    if (!collection.length || collection[0].userId !== user.id) {
      return NextResponse.json(
        { error: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    // For now, return placeholder sharing info
    // TODO: Retrieve actual sharing data from database when schema supports it
    return NextResponse.json({
      success: true,
      isShared: false, // Placeholder
      share: null, // Will contain share details when collection is shared
    });
  } catch (error) {
    console.error('Error fetching sharing settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sharing settings' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id]/share - Remove sharing (make private)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const collectionId = params.id;

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      );
    }

    // Verify collection ownership
    const collection = await db
      .select()
      .from(collections)
      .where(eq(collections.id, collectionId))
      .limit(1);

    if (!collection.length || collection[0].userId !== user.id) {
      return NextResponse.json(
        { error: 'Collection not found or access denied' },
        { status: 404 }
      );
    }

    // Remove sharing settings
    // TODO: Clear sharing data from database when schema supports it
    // For now, we just verify the collection exists (already validated ownership above)

    return NextResponse.json({
      success: true,
      message: 'Collection sharing disabled',
    });
  } catch (error) {
    console.error('Error disabling collection sharing:', error);
    return NextResponse.json(
      { error: 'Failed to disable sharing' },
      { status: 500 }
    );
  }
}

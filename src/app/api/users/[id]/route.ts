import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, users, AsyncUserRouteParams } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/users/[id] - Get user profile
export async function GET(request: NextRequest, context: AsyncUserRouteParams) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userProfile || userProfile.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: userProfile[0],
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(request: NextRequest, context: AsyncUserRouteParams) {
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
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user is updating their own profile
    if (id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this profile' },
        { status: 403 }
      );
    }

    // Check if user exists in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const { name, image } = body;

    let updatedUser;

    if (!existingUser || existingUser.length === 0) {
      // Create new user record if doesn't exist
      updatedUser = await db
        .insert(users)
        .values({
          id: user.id,
          clerkId: user.id, // Clerk user ID
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: name || user.firstName || '',
          profileImageUrl: image || user.imageUrl || '',
          // Legacy fields for backward compatibility
          name: name || user.firstName || '',
          image: image || user.imageUrl || '',
        })
        .returning();
    } else {
      // Update existing user
      updatedUser = await db
        .update(users)
        .set({
          firstName: name || existingUser[0].firstName,
          profileImageUrl: image || existingUser[0].profileImageUrl,
          // Legacy fields for backward compatibility
          name: name || existingUser[0].name,
          image: image || existingUser[0].image,
        })
        .where(eq(users.id, id))
        .returning();
    }

    return NextResponse.json({
      message: 'User profile updated successfully',
      user: updatedUser[0],
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

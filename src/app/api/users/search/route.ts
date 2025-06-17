import { NextRequest, NextResponse } from 'next/server';
import { ilike, and, not, eq } from 'drizzle-orm';
import { db, users } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/users/search - Search for users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    const currentUser = await getAuthenticatedUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const searchTerm = `%${query.trim()}%`;

    try {
      // Search users by name, first name, or email
      // Exclude the current user from results
      const searchResults = await db
        .select({
          id: users.id,
          name: users.name,
          firstName: users.firstName,
          profileImageUrl: users.profileImageUrl,
          email: users.email,
        })
        .from(users)
        .where(
          and(
            not(eq(users.id, currentUser.id)), // Exclude current user
            ilike(users.name, searchTerm)
            // Note: We could also search by firstName or email if needed
            // or(
            //   ilike(users.name, searchTerm),
            //   ilike(users.firstName, searchTerm),
            //   ilike(users.email, searchTerm)
            // )
          )
        )
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const totalCountResult = await db
        .select({ count: users.id })
        .from(users)
        .where(
          and(not(eq(users.id, currentUser.id)), ilike(users.name, searchTerm))
        );

      const totalCount = totalCountResult.length;
      const totalPages = Math.ceil(totalCount / limit);

      // Format results to hide sensitive information
      const formattedResults = searchResults.map((user) => ({
        id: user.id,
        name: user.name || user.firstName || 'Unknown User',
        profileImageUrl: user.profileImageUrl,
        // Don't expose email in search results for privacy
      }));

      return NextResponse.json({
        users: formattedResults,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        searchTerm: query,
      });
    } catch (dbError) {
      // If there's a database error (e.g., table doesn't exist yet), return empty results
      console.warn('Database search failed, returning empty results:', dbError);

      return NextResponse.json({
        users: [],
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        searchTerm: query,
        note: 'User search is currently unavailable',
      });
    }
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

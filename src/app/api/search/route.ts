import { NextRequest, NextResponse } from 'next/server';

// GET /api/search - Global search across recipes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const searchTerm = query.trim();

    // For now, return a simple mock response to avoid Drizzle type issues
    // This would need to be replaced with actual database search when type issues are resolved
    const mockResults = {
      recipes: [],
      pagination: {
        page,
        limit,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      searchTerm,
    };

    return NextResponse.json(mockResults);
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

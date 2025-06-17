import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/search - Global search across recipes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const tags = searchParams.get('tags');
    const difficulty = searchParams.get('difficulty');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const searchTerm = query.trim();

    // Build search conditions
    const searchConditions = sql`(
      title ILIKE ${'%' + searchTerm + '%'} OR 
      description ILIKE ${'%' + searchTerm + '%'} OR 
      instructions ILIKE ${'%' + searchTerm + '%'}
    )`;

    // Additional filters
    const filters = [];
    if (category) {
      filters.push(sql`category_id = ${category}`);
    }
    if (difficulty) {
      filters.push(sql`difficulty = ${difficulty}`);
    }
    if (tags) {
      const tagList = tags.split(',').map((tag) => tag.trim());
      filters.push(sql`tags && ${tagList}`);
    }

    // Combine all conditions
    let whereClause = searchConditions;
    if (filters.length > 0) {
      whereClause = sql`${searchConditions} AND ${sql.join(filters, sql` AND `)}`;
    }

    // Build sort order
    let orderBy;
    switch (sortBy) {
      case 'title':
        orderBy = sql`title ASC`;
        break;
      case 'created':
        orderBy = sql`created_at DESC`;
        break;
      case 'rating':
        orderBy = sql`average_rating DESC NULLS LAST`;
        break;
      default: // relevance
        orderBy = sql`
          CASE 
            WHEN title ILIKE ${searchTerm + '%'} THEN 1
            WHEN title ILIKE ${'%' + searchTerm + '%'} THEN 2
            WHEN description ILIKE ${searchTerm + '%'} THEN 3
            ELSE 4
          END ASC,
          average_rating DESC NULLS LAST
        `;
    }

    // Get total count
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM recipes 
      WHERE ${whereClause}
        AND status = 'published'
    `);
    const totalCount = Number(countResult[0]?.count || 0);

    // Get recipes with basic info
    const recipes = await db.execute(sql`
      SELECT 
        r.id,
        r.title,
        r.description,
        r.prep_time,
        r.cook_time,
        r.difficulty,
        r.image_url,
        r.average_rating,
        r.total_ratings,
        r.created_at,
        r.author_id,
        u.full_name as author_name,
        u.image_url as author_image,
        c.name as category_name
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.clerk_id
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE ${whereClause}
        AND r.status = 'published'
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    const totalPages = Math.ceil(totalCount / limit);

    const results = {
      recipes: recipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        prepTime: recipe.prep_time,
        cookTime: recipe.cook_time,
        difficulty: recipe.difficulty,
        imageUrl: recipe.image_url,
        averageRating: recipe.average_rating,
        totalRatings: recipe.total_ratings,
        createdAt: recipe.created_at,
        author: {
          id: recipe.author_id,
          name: recipe.author_name,
          image: recipe.author_image,
        },
        category: recipe.category_name,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      searchTerm,
      appliedFilters: {
        category,
        tags,
        difficulty,
        sortBy,
      },
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

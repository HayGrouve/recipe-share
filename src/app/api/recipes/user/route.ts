import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { recipes } from '@haygrouve/db-schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's recipes using simple select pattern like in recipes/route.ts
    const userRecipes = await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId))
      .orderBy(desc(recipes.createdAt));

    // Calculate basic statistics from the results
    const totalRecipes = userRecipes.length;
    const publishedRecipes = userRecipes.filter((r) => r.isPublished).length;
    const draftRecipes = userRecipes.filter((r) => !r.isPublished).length;

    const stats = {
      totalRecipes,
      publishedRecipes,
      draftRecipes,
      privateRecipes: 0, // TODO: Add when private status is available
      totalViews: 0, // TODO: Add when view tracking is implemented
      totalSaves: 0, // TODO: Add when save tracking is implemented
      averageRating: 0, // TODO: Add when rating system is implemented
    };

    // Format recipes for frontend
    const formattedRecipes = userRecipes.map((recipe) => ({
      ...recipe,
      images: [], // TODO: Add image lookup when schema is stable
      viewCount: 0, // TODO: Add when view tracking is implemented
      rating: 0, // TODO: Add when rating system is implemented
      ratingCount: 0, // TODO: Add when rating system is implemented
      saveCount: 0, // TODO: Add when save tracking is implemented
      commentsCount: 0, // TODO: Add when comment system is implemented
      status: recipe.isPublished ? 'published' : 'draft', // Map isPublished to status
      difficulty: 'medium', // TODO: Add when difficulty field is available
      cuisine: '', // TODO: Add when cuisine field is available
      category: '', // TODO: Add when category field is available
      createdAt: recipe.createdAt?.toISOString(),
      updatedAt: recipe.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      recipes: formattedRecipes,
      stats,
    });
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}

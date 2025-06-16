import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import {
  db,
  recipes,
  users,
  ingredients,
  recipeIngredients,
  categories,
  recipeCategories,
  tags,
  recipeTags,
  recipeImages,
  nutrition,
} from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

interface RecipeFilters {
  category?: string;
  tags?: string[];
  search?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// GET /api/recipes - List recipes with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: RecipeFilters = {
      category: searchParams.get('category') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const pagination: PaginationParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 12,
      sortBy:
        (searchParams.get('sortBy') as 'newest' | 'oldest' | 'title') ||
        'newest',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Validate pagination
    if (pagination.page! < 1) pagination.page = 1;
    if (pagination.limit! < 1 || pagination.limit! > 100) pagination.limit = 12;

    // Use a simpler query approach to avoid type issues
    const baseQuery = db
      .select()
      .from(recipes)
      .leftJoin(users, eq(recipes.userId, users.id))
      .where(eq(recipes.isPublished, true));

    // Execute the base query and filter in memory for now
    // This is a temporary workaround for the type compatibility issues
    let results = await baseQuery;

    // Apply search filter if provided
    if (filters.search) {
      results = results.filter(
        (item) =>
          item.recipes.title
            ?.toLowerCase()
            .includes(filters.search!.toLowerCase()) ||
          item.recipes.description
            ?.toLowerCase()
            .includes(filters.search!.toLowerCase())
      );
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (pagination.sortBy) {
        case 'oldest':
          return (
            new Date(a.recipes.createdAt).getTime() -
            new Date(b.recipes.createdAt).getTime()
          );
        case 'title':
          const titleA = a.recipes.title || '';
          const titleB = b.recipes.title || '';
          return pagination.sortOrder === 'asc'
            ? titleA.localeCompare(titleB)
            : titleB.localeCompare(titleA);
        case 'newest':
        default:
          return (
            new Date(b.recipes.createdAt).getTime() -
            new Date(a.recipes.createdAt).getTime()
          );
      }
    });

    // Apply pagination
    const totalCount = results.length;
    const offset = (pagination.page! - 1) * pagination.limit!;
    const paginatedResults = results.slice(offset, offset + pagination.limit!);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pagination.limit!);
    const hasNextPage = pagination.page! < totalPages;
    const hasPrevPage = pagination.page! > 1;

    // Format results
    const formattedResults = paginatedResults.map((item) => ({
      ...item.recipes,
      author: item.users,
      primaryImage: null, // TODO: Add image lookup when schema is stable
    }));

    return NextResponse.json({
      recipes: formattedResults,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: filters,
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create new recipe
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      instructions: instructionText,
      ingredients: recipeIngredientsList,
      prepTime,
      cookTime,
      servings,
      isPublished = true,
      categories: categoryNames = [],
      tags: tagNames = [],
      images = [],
      nutrition: nutritionData,
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description' },
        { status: 400 }
      );
    }

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // 1. Create the recipe with correct schema
      const [newRecipe] = await tx
        .insert(recipes)
        .values({
          title,
          description,
          instructions: instructionText || '',
          prepTime: prepTime || 0,
          cookTime: cookTime || 0,
          servings: servings || 1,
          isPublished,
          userId: user.id,
        })
        .returning();

      const recipeId = newRecipe.id;

      // 2. Add ingredients if provided
      if (recipeIngredientsList && recipeIngredientsList.length > 0) {
        for (const ingredientData of recipeIngredientsList) {
          // Find or create ingredient
          const ingredient = await tx
            .select()
            .from(ingredients)
            .where(eq(ingredients.name, ingredientData.name))
            .limit(1);

          let ingredientId;
          if (ingredient.length === 0) {
            const [newIngredient] = await tx
              .insert(ingredients)
              .values({
                name: ingredientData.name,
              })
              .returning();
            ingredientId = newIngredient.id;
          } else {
            ingredientId = ingredient[0].id;
          }

          // Add recipe ingredient
          await tx.insert(recipeIngredients).values({
            recipeId,
            ingredientId,
            quantity: ingredientData.amount || '',
            unit: ingredientData.unit || '',
          });
        }
      }

      // 3. Add categories if provided
      if (categoryNames && categoryNames.length > 0) {
        for (const categoryName of categoryNames) {
          const category = await tx
            .select()
            .from(categories)
            .where(eq(categories.name, categoryName))
            .limit(1);

          let categoryId;
          if (category.length === 0) {
            const [newCategory] = await tx
              .insert(categories)
              .values({ name: categoryName })
              .returning();
            categoryId = newCategory.id;
          } else {
            categoryId = category[0].id;
          }

          await tx.insert(recipeCategories).values({
            recipeId,
            categoryId,
          });
        }
      }

      // 4. Add tags if provided
      if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
          const tag = await tx
            .select()
            .from(tags)
            .where(eq(tags.name, tagName))
            .limit(1);

          let tagId;
          if (tag.length === 0) {
            const [newTag] = await tx
              .insert(tags)
              .values({ name: tagName })
              .returning();
            tagId = newTag.id;
          } else {
            tagId = tag[0].id;
          }

          await tx.insert(recipeTags).values({
            recipeId,
            tagId,
          });
        }
      }

      // 5. Add images if provided
      if (images && images.length > 0) {
        interface ImageData {
          url: string;
          altText?: string;
        }

        const imagesToInsert = images.map(
          (image: ImageData, index: number) => ({
            recipeId,
            imageUrl: image.url,
            altText: image.altText || title,
            isPrimary: index === 0, // First image is primary
          })
        );

        await tx.insert(recipeImages).values(imagesToInsert);
      }

      // 6. Add nutrition data if provided
      if (nutritionData) {
        await tx.insert(nutrition).values({
          recipeId,
          calories: nutritionData.calories || null,
          protein: nutritionData.protein || null,
          carbohydrates: nutritionData.carbohydrates || null,
          fat: nutritionData.fat || null,
          fiber: nutritionData.fiber || null,
          sugar: nutritionData.sugar || null,
          sodium: nutritionData.sodium || null,
        });
      }

      return newRecipe;
    });

    return NextResponse.json(
      {
        message: 'Recipe created successfully',
        recipe: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}

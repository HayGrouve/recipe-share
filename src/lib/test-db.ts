// Test file to verify database connection and schema import
import { db } from './db';
import * as schema from '@haygrouve/db-schema';

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');

    // Test basic connection
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);

    // Test schema import
    console.log('✅ Schema imported successfully');
    console.log('Available tables:', Object.keys(schema));

    return {
      success: true,
      message: 'Database connection and schema import working correctly',
    };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Example usage of schema (commented out to avoid actual DB calls during testing)
/*
export async function exampleQueries() {
  // Example: Get all recipes
  const recipes = await db.select().from(schema.recipes);
  
  // Example: Get a specific recipe with ingredients
  const recipeWithIngredients = await db
    .select()
    .from(schema.recipes)
    .leftJoin(schema.recipes_recipe_ingredients, eq(schema.recipes.id, schema.recipes_recipe_ingredients.recipeId))
    .leftJoin(schema.recipes_ingredients, eq(schema.recipes_recipe_ingredients.ingredientId, schema.recipes_ingredients.id))
    .where(eq(schema.recipes.id, 1));
    
  return { recipes, recipeWithIngredients };
}
*/

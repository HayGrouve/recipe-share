import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@haygrouve/db-schema';
import {
  users,
  recipes,
  ingredients,
  recipeIngredients,
  instructions,
  recipeImages,
  categories,
  recipeCategories,
  tags,
  recipeTags,
  nutrition,
  ratings,
  comments,
  savedRecipes,
  collections,
  collectionRecipes,
  follows,
} from '@haygrouve/db-schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = postgres(connectionString, { prepare: false });

export const db = drizzle(sql, { schema });

export {
  schema,
  users,
  recipes,
  ingredients,
  recipeIngredients,
  instructions,
  recipeImages,
  categories,
  recipeCategories,
  tags,
  recipeTags,
  nutrition,
  ratings,
  comments,
  savedRecipes,
  collections,
  collectionRecipes,
  follows,
};

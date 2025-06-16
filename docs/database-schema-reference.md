# Database Schema Reference

This document serves as a guide for working with the database schema in the RecipeShare application, which uses the `@haygrouve/db-schema` package as the source of truth for all table definitions and relationships.

## Schema Source of Truth

**The `@haygrouve/db-schema` package is the single source of truth for all database schema information.**

- ✅ **Use**: Import tables and types directly from `@haygrouve/db-schema`
- ❌ **Don't**: Maintain separate schema files or documentation that can become outdated
- ✅ **Reference**: Check the package source for the most up-to-date schema definitions

## Available Tables and Exports

The schema package provides all table definitions and relationships. Here's how to access them:

### Database Connection

```typescript
// src/lib/db.ts
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
const sql = postgres(connectionString, { prepare: false });
export const db = drizzle(sql, { schema });
```

### Table Imports

Import tables directly from the package for type-safe database operations:

```typescript
import { db, recipes, users, collections } from '@/lib/db';
import { eq, desc, and } from 'drizzle-orm';

// Type-safe queries
const userRecipes = await db
  .select()
  .from(recipes)
  .where(eq(recipes.userId, userId))
  .orderBy(desc(recipes.createdAt));
```

### Type Imports

The package also exports TypeScript types for Next.js 15 compatibility:

```typescript
import type {
  Recipe,
  RecipeWithAuthor,
  RecipeWithDetails,
  ClerkUser,
  ApiResponse,
  PaginatedResponse,
  AsyncRouteParams,
} from '@haygrouve/db-schema';
```

## Core Tables Overview

### Primary Tables

- **`users`** - User accounts linked to Clerk authentication
- **`recipes`** - Main recipe data (title, description, times, etc.)
- **`collections`** - User-created recipe collections
- **`ingredients`** - Master list of ingredients
- **`categories`** - Recipe categories and classification
- **`tags`** - Recipe tags for filtering and discovery

### Relationship Tables

- **`recipeIngredients`** - Links recipes to ingredients with quantities
- **`recipeImages`** - Multiple images per recipe
- **`instructions`** - Step-by-step recipe instructions
- **`collectionRecipes`** - Links recipes to collections
- **`recipeTags`** - Links recipes to tags
- **`recipeCategories`** - Links recipes to categories

### Social & Analytics Tables

- **`ratings`** - User ratings and reviews for recipes
- **`comments`** - Recipe comments and discussions
- **`savedRecipes`** - User bookmarks/favorites
- **`follows`** - User following relationships
- **`nutrition`** - Nutritional information per recipe

## Common Query Patterns

### User Recipes with Status

```typescript
import { db, recipes } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Get user's recipes with published/draft status
const userRecipes = await db
  .select()
  .from(recipes)
  .where(eq(recipes.userId, userId));

// The package handles the isPublished field mapping
const formattedRecipes = userRecipes.map((recipe) => ({
  ...recipe,
  status: recipe.isPublished ? 'published' : 'draft',
}));
```

### Recipe with Collections

```typescript
import { db, recipes, collections, collectionRecipes } from '@/lib/db';
import { eq } from 'drizzle-orm';

const recipeCollections = await db
  .select({
    recipe: recipes,
    collection: collections,
  })
  .from(recipes)
  .leftJoin(collectionRecipes, eq(recipes.id, collectionRecipes.recipeId))
  .leftJoin(collections, eq(collectionRecipes.collectionId, collections.id))
  .where(eq(recipes.id, recipeId));
```

### Bulk Operations

```typescript
import { db, recipes } from '@/lib/db';
import { inArray, eq, and } from 'drizzle-orm';

// Update multiple recipes status
await db
  .update(recipes)
  .set({ isPublished: true, updatedAt: new Date() })
  .where(and(eq(recipes.userId, userId), inArray(recipes.id, recipeIds)));
```

## Schema Field Mapping

### Recipe Status

The database uses `isPublished` boolean field, but the frontend uses status strings:

```typescript
// Database field: isPublished (boolean)
// Frontend mapping:
const status = recipe.isPublished ? 'published' : 'draft';

// When updating:
const isPublished = status === 'published';
await db.update(recipes).set({ isPublished }).where(eq(recipes.id, id));
```

### User References

User IDs are stored as strings to match Clerk's format:

```typescript
// Clerk user ID format
const userId: string = user.id; // e.g., "user_2abc123def456"

// Database queries
const userRecipes = await db
  .select()
  .from(recipes)
  .where(eq(recipes.userId, userId));
```

## Best Practices

### 1. Always Import from Package

```typescript
// ✅ Good - Import from package
import { recipes, users } from '@haygrouve/db-schema';

// ❌ Bad - Don't create local schema definitions
const localRecipesSchema = pgTable('recipes', {
  /* ... */
});
```

### 2. Use Type-Safe Queries

```typescript
// ✅ Good - Type-safe with proper imports
import { db, recipes } from '@/lib/db';
import { eq } from 'drizzle-orm';

const recipe = await db
  .select()
  .from(recipes)
  .where(eq(recipes.id, id))
  .limit(1);

// ❌ Bad - Raw SQL or untyped queries
const recipe = await db.execute(sql`SELECT * FROM recipes WHERE id = ${id}`);
```

### 3. Handle Schema Evolution

```typescript
// ✅ Good - Check for field existence when schema evolves
const formattedRecipe = {
  ...recipe,
  status: recipe.isPublished ? 'published' : 'draft',
  // Handle optional fields gracefully
  cuisine: recipe.cuisine || '',
  difficulty: recipe.difficulty || 'medium',
};
```

### 4. Proper Error Handling

```typescript
try {
  const result = await db.insert(recipes).values(recipeData).returning();

  return { success: true, data: result[0] };
} catch (error) {
  console.error('Database error:', error);
  return { success: false, error: 'Failed to create recipe' };
}
```

## Schema Updates

When you need schema changes:

1. **Contact the package maintainer** with the required schema modifications
2. **Provide exact Drizzle definitions** for new tables or fields
3. **Wait for package update** before implementing features that depend on schema changes
4. **Update package version** when changes are published: `npm update @haygrouve/db-schema`

## Troubleshooting

### Type Errors

If you encounter TypeScript errors:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check package version
npm list @haygrouve/db-schema
```

### Missing Fields

If fields seem missing, verify you're using the latest package version:

```bash
npm update @haygrouve/db-schema
```

### Import Issues

Ensure you're importing from the correct path:

```typescript
// ✅ Correct
import { recipes } from '@haygrouve/db-schema';

// ❌ Incorrect
import { recipes } from '@/lib/schema';
```

## Package Information

- **Package**: `@haygrouve/db-schema`
- **Purpose**: Shared database schema for multiple projects
- **Database**: Vercel Postgres with `recipes_` table prefix
- **ORM**: Drizzle ORM with postgres-js adapter

For the most current schema information, always refer to the package source code rather than documentation that may become outdated.

# Database Setup Improvements

This document outlines the improvements made to the database setup to follow best practices for using the `@haygrouve/db-schema` shared package.

> **Note**: For current database schema reference and usage patterns, see [`database-schema-reference.md`](./database-schema-reference.md) which serves as the comprehensive guide for working with the `@haygrouve/db-schema` package.

## Changes Made

### 1. **Migrated from node-postgres to postgres-js**

- **Before**: Used `drizzle-orm/node-postgres` with `Pool` from `pg`
- **After**: Using `drizzle-orm/postgres-js` with `postgres` package
- **Benefits**: Better performance, simpler setup, consistent with shared package

### 2. **Enhanced Import Strategy**

- **Before**: Only imported `* as schema`
- **After**: Import both the complete schema and individual tables

```typescript
import * as schema from '@haygrouve/db-schema';
import {
  users,
  recipes,
  ingredients,
  // ... all other tables
} from '@haygrouve/db-schema';
```

### 3. **Improved Database Configuration**

- Added proper error handling for missing `DATABASE_URL`
- Configured postgres with `{ prepare: false }` for compatibility
- Export both the `db` instance and individual tables for convenience

### 4. **Type-Safe Table Access**

Now you can use tables in two ways:

**Option 1: Via schema object**

```typescript
await db.select().from(schema.users);
```

**Option 2: Direct import (recommended)**

```typescript
await db.select().from(users);
```

## Current Setup

### Database Connection (`src/lib/db.ts`)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@haygrouve/db-schema';
import { users, recipes /* ... other tables */ } from '@haygrouve/db-schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = postgres(connectionString, { prepare: false });
export const db = drizzle(sql, { schema });
```

### Available Tables

The following tables are directly imported and ready to use:

- `users` - User accounts linked to Clerk
- `recipes` - Recipe data
- `ingredients` - Ingredient master list
- `recipeIngredients` - Recipe-ingredient relationships
- `instructions` - Recipe instructions
- `recipeImages` - Recipe photos
- `categories` - Recipe categories
- `recipeCategories` - Recipe-category relationships
- `tags` - Recipe tags
- `recipeTags` - Recipe-tag relationships
- `nutrition` - Nutritional information
- `ratings` - Recipe ratings
- `comments` - Recipe comments
- `savedRecipes` - User saved recipes
- `collections` - Recipe collections
- `collectionRecipes` - Collection-recipe relationships
- `follows` - User following relationships

## Usage Examples

### Basic Queries

```typescript
import { db, users, recipes } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Get all users
const allUsers = await db.select().from(users);

// Get user by Clerk ID
const user = await db
  .select()
  .from(users)
  .where(eq(users.clerkId, 'clerk_id_here'));

// Get recipes with user info
const recipesWithUsers = await db
  .select()
  .from(recipes)
  .leftJoin(users, eq(recipes.userId, users.id));
```

### Advanced Queries

```typescript
// Get recipe with all related data
const fullRecipe = await db
  .select()
  .from(recipes)
  .leftJoin(users, eq(recipes.userId, users.id))
  .leftJoin(recipeIngredients, eq(recipes.id, recipeIngredients.recipeId))
  .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
  .where(eq(recipes.id, recipeId));
```

## Benefits

1. **Consistency**: Matches the pattern used in other projects with the shared package
2. **Performance**: postgres-js is faster than node-postgres
3. **Type Safety**: Full TypeScript support with proper table types
4. **Convenience**: Direct table imports reduce verbosity
5. **Maintainability**: Clear separation of concerns

## Next Steps

1. Set up environment variables (`DATABASE_URL`)
2. Test the connection with real database
3. Implement webhook database sync once drizzle-orm version compatibility is resolved
4. Add database queries to API routes
5. Implement user synchronization with Clerk webhooks

---

**Historical Note**: This document describes the migration process and improvements made to use the `@haygrouve/db-schema` package. For current schema reference and usage patterns, refer to [`database-schema-reference.md`](./database-schema-reference.md).

# Database Schema Setup for RecipeShare

This file serves as the source of truth for database schema definitions in Drizzle format. When schema changes are needed, update this file and request that the changes be applied to the `@haygrouve/db-schema` package.

## Schema Overview

The RecipeShare application uses a shared Vercel Postgres database managed through the `@haygrouve/db-schema` package. All tables use the `recipes_` prefix to avoid conflicts with other projects in the shared database.

## Table Definitions

### 1. Users Table

```typescript
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

export const recipes_users = pgTable('recipes_users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 256 }).notNull().unique(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  username: varchar('username', { length: 50 }).unique(),
  bio: text('bio'),
  profileImageUrl: varchar('profile_image_url', { length: 512 }),
  isPrivate: boolean('is_private').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### 2. Recipes Table

```typescript
export const recipes = pgTable(
  'recipes',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 256 }).notNull(),
    description: text('description'),
    prepTime: integer('prep_time'), // minutes
    cookTime: integer('cook_time'), // minutes
    totalTime: integer('total_time'), // minutes
    servings: integer('servings'),
    difficulty: varchar('difficulty', { length: 20 }), // 'easy', 'medium', 'hard'
    cuisine: varchar('cuisine', { length: 100 }),
    category: varchar('category', { length: 100 }), // 'breakfast', 'lunch', 'dinner', etc.
    imageUrl: varchar('image_url', { length: 512 }),
    instructions: text('instructions').notNull(),
    isPublic: boolean('is_public').default(true),
    isDraft: boolean('is_draft').default(false),
    userId: varchar('user_id', { length: 256 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('recipes_user_id_idx').on(table.userId),
    cuisineIdx: index('recipes_cuisine_idx').on(table.cuisine),
    categoryIdx: index('recipes_category_idx').on(table.category),
  })
);
```

### 3. Ingredients Table

```typescript
export const recipes_ingredients = pgTable(
  'recipes_ingredients',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull().unique(),
    category: varchar('category', { length: 100 }), // 'protein', 'vegetable', 'spice', etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('recipes_ingredients_name_idx').on(table.name),
    categoryIdx: index('recipes_ingredients_category_idx').on(table.category),
  })
);
```

### 4. Recipe Ingredients Junction Table

```typescript
export const recipes_recipe_ingredients = pgTable(
  'recipes_recipe_ingredients',
  {
    id: serial('id').primaryKey(),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    ingredientId: integer('ingredient_id')
      .notNull()
      .references(() => recipes_ingredients.id),
    quantity: varchar('quantity', { length: 50 }), // e.g., "2", "1/2", "1-2"
    unit: varchar('unit', { length: 50 }), // e.g., "cups", "tablespoons", "grams"
    notes: varchar('notes', { length: 256 }), // e.g., "chopped", "optional"
    orderIndex: integer('order_index').default(0),
  },
  (table) => ({
    recipeIdIdx: index('recipes_recipe_ingredients_recipe_id_idx').on(
      table.recipeId
    ),
    ingredientIdIdx: index('recipes_recipe_ingredients_ingredient_id_idx').on(
      table.ingredientId
    ),
  })
);
```

### 5. Recipe Images Table

```typescript
export const recipes_recipe_images = pgTable(
  'recipes_recipe_images',
  {
    id: serial('id').primaryKey(),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    imageUrl: varchar('image_url', { length: 512 }).notNull(),
    caption: varchar('caption', { length: 256 }),
    isPrimary: boolean('is_primary').default(false),
    orderIndex: integer('order_index').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    recipeIdIdx: index('recipes_recipe_images_recipe_id_idx').on(
      table.recipeId
    ),
  })
);
```

### 6. Categories Table

```typescript
export const recipes_categories = pgTable('recipes_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // Lucide icon name
  color: varchar('color', { length: 7 }), // hex color code
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 7. Tags Table

```typescript
export const recipes_tags = pgTable(
  'recipes_tags',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    type: varchar('type', { length: 50 }), // 'dietary', 'cooking-method', 'occasion', etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('recipes_tags_name_idx').on(table.name),
    typeIdx: index('recipes_tags_type_idx').on(table.type),
  })
);
```

### 8. Recipe Tags Junction Table

```typescript
export const recipes_recipe_tags = pgTable(
  'recipes_recipe_tags',
  {
    id: serial('id').primaryKey(),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => recipes_tags.id),
  },
  (table) => ({
    recipeIdIdx: index('recipes_recipe_tags_recipe_id_idx').on(table.recipeId),
    tagIdIdx: index('recipes_recipe_tags_tag_id_idx').on(table.tagId),
    uniqueRecipeTag: unique('recipes_recipe_tags_unique').on(
      table.recipeId,
      table.tagId
    ),
  })
);
```

### 9. Collections Table

```typescript
export const recipes_collections = pgTable(
  'recipes_collections',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: text('description'),
    isPublic: boolean('is_public').default(false),
    coverImageUrl: varchar('cover_image_url', { length: 512 }),
    userId: varchar('user_id', { length: 256 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('recipes_collections_user_id_idx').on(table.userId),
  })
);
```

### 10. Collection Recipes Junction Table

```typescript
export const recipes_collection_recipes = pgTable(
  'recipes_collection_recipes',
  {
    id: serial('id').primaryKey(),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => recipes_collections.id, { onDelete: 'cascade' }),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    addedAt: timestamp('added_at').defaultNow().notNull(),
  },
  (table) => ({
    collectionIdIdx: index('recipes_collection_recipes_collection_id_idx').on(
      table.collectionId
    ),
    recipeIdIdx: index('recipes_collection_recipes_recipe_id_idx').on(
      table.recipeId
    ),
    uniqueCollectionRecipe: unique('recipes_collection_recipes_unique').on(
      table.collectionId,
      table.recipeId
    ),
  })
);
```

### 11. Recipe Ratings Table

```typescript
export const recipes_recipe_ratings = pgTable(
  'recipes_recipe_ratings',
  {
    id: serial('id').primaryKey(),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 256 }).notNull(),
    rating: integer('rating').notNull(), // 1-5 stars
    review: text('review'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    recipeIdIdx: index('recipes_recipe_ratings_recipe_id_idx').on(
      table.recipeId
    ),
    userIdIdx: index('recipes_recipe_ratings_user_id_idx').on(table.userId),
    uniqueUserRecipeRating: unique('recipes_recipe_ratings_unique').on(
      table.recipeId,
      table.userId
    ),
  })
);
```

### 12. Recipe Comments Table

```typescript
export const recipes_recipe_comments = pgTable(
  'recipes_recipe_comments',
  {
    id: serial('id').primaryKey(),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 256 }).notNull(),
    content: text('content').notNull(),
    parentId: integer('parent_id').references(() => recipes_recipe_comments.id), // for replies
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    recipeIdIdx: index('recipes_recipe_comments_recipe_id_idx').on(
      table.recipeId
    ),
    userIdIdx: index('recipes_recipe_comments_user_id_idx').on(table.userId),
    parentIdIdx: index('recipes_recipe_comments_parent_id_idx').on(
      table.parentId
    ),
  })
);
```

### 13. User Follows Table

```typescript
export const recipes_user_follows = pgTable(
  'recipes_user_follows',
  {
    id: serial('id').primaryKey(),
    followerId: varchar('follower_id', { length: 256 }).notNull(),
    followingId: varchar('following_id', { length: 256 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    followerIdIdx: index('recipes_user_follows_follower_id_idx').on(
      table.followerId
    ),
    followingIdIdx: index('recipes_user_follows_following_id_idx').on(
      table.followingId
    ),
    uniqueFollow: unique('recipes_user_follows_unique').on(
      table.followerId,
      table.followingId
    ),
  })
);
```

### 14. Recipe Saves Table

```typescript
export const recipes_recipe_saves = pgTable(
  'recipes_recipe_saves',
  {
    id: serial('id').primaryKey(),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 256 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    recipeIdIdx: index('recipes_recipe_saves_recipe_id_idx').on(table.recipeId),
    userIdIdx: index('recipes_recipe_saves_user_id_idx').on(table.userId),
    uniqueUserRecipeSave: unique('recipes_recipe_saves_unique').on(
      table.recipeId,
      table.userId
    ),
  })
);
```

### 15. Nutrition Information Table

```typescript
export const recipes_nutrition = pgTable('recipes_nutrition', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' })
    .unique(),
  calories: integer('calories'),
  protein: decimal('protein', { precision: 5, scale: 2 }), // grams
  carbohydrates: decimal('carbohydrates', { precision: 5, scale: 2 }), // grams
  fat: decimal('fat', { precision: 5, scale: 2 }), // grams
  fiber: decimal('fiber', { precision: 5, scale: 2 }), // grams
  sugar: decimal('sugar', { precision: 5, scale: 2 }), // grams
  sodium: decimal('sodium', { precision: 5, scale: 2 }), // milligrams
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## Relationships

- Users can have many recipes, collections, ratings, comments, and follows
- Recipes belong to a user and can have many ingredients, images, ratings, comments, tags, and saves
- Collections belong to a user and can contain many recipes
- Ingredients can be used in many recipes through the junction table
- Tags can be applied to many recipes through the junction table
- Users can follow other users and save recipes

## Migration Instructions

When these schema definitions need to be applied to the `@haygrouve/db-schema` package:

1. Copy the relevant table definitions from this file
2. Add them to the shared package with proper exports
3. Update the package version
4. Run `npm update @haygrouve/db-schema` in this project
5. The package maintainer handles database migrations in Vercel Postgres

## Notes

- All tables use the `recipes_` prefix to avoid conflicts in the shared database
- User IDs are stored as varchar to match Clerk's user ID format
- Timestamps use PostgreSQL's timestamp type with timezone
- Foreign key constraints include cascade deletion where appropriate
- Indexes are added for commonly queried fields
- Unique constraints prevent duplicate data where needed

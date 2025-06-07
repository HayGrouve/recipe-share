# Schema Update Workflow

This document outlines the process for requesting and implementing database schema changes when using the external `@haygrouve/db-schema` package.

## Overview

The RecipeShare application uses the `@haygrouve/db-schema` package to manage database schemas. This shared package allows multiple projects to connect to a single Vercel Postgres database while maintaining schema consistency and avoiding conflicts.

## When Schema Changes Are Needed

Schema changes may be required when:

- Adding new features that require new tables or columns
- Modifying existing table structures
- Adding or removing indexes for performance optimization
- Updating relationships between tables
- Adding new constraints or validation rules

## Workflow Steps

### 1. Update Local Schema Documentation

When a schema change is needed:

1. **Update `database_setup.md`** with the new or modified table definitions in Drizzle format
2. **Document the change reason** and any migration considerations
3. **Include any new relationships** or constraints that need to be established

### 2. Request Package Update

After updating the local documentation:

1. **Contact the package maintainer** (you) with the schema change request
2. **Reference the updated `database_setup.md`** file for the exact schema definitions
3. **Provide context** about why the change is needed and any urgency
4. **Include any special migration instructions** if the change affects existing data

### 3. Package Update Process

The package maintainer will:

1. **Review the schema changes** for conflicts with other projects
2. **Add the new schema definitions** to the `@haygrouve/db-schema` package
3. **Handle database migrations** in the Vercel Postgres instance
4. **Publish a new package version** with the updated schema
5. **Notify when the update is complete** and provide the new version number

### 4. Local Project Update

Once the package is updated:

1. **Update the package version** in your project:

   ```bash
   npm update @haygrouve/db-schema
   ```

2. **Verify the new schema** is available by checking imports:

   ```typescript
   import * as schema from '@haygrouve/db-schema';
   // New tables should be available here
   ```

3. **Update your application code** to use the new schema definitions

4. **Test the changes** to ensure everything works correctly

## Example Schema Change Request

### Scenario: Adding a Recipe Reviews Feature

**1. Update `database_setup.md`:**

```typescript
// Add to database_setup.md
export const recipes_recipe_reviews = pgTable(
  'recipes_recipe_reviews',
  {
    id: serial('id').primaryKey(),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 256 }).notNull(),
    title: varchar('title', { length: 256 }).notNull(),
    content: text('content').notNull(),
    helpfulCount: integer('helpful_count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    recipeIdIdx: index('recipes_recipe_reviews_recipe_id_idx').on(
      table.recipeId
    ),
    userIdIdx: index('recipes_recipe_reviews_user_id_idx').on(table.userId),
  })
);
```

**2. Request Message:**

```
Hi! I need to add a new table for recipe reviews. I've updated the database_setup.md
file with the new `recipes_recipe_reviews` table definition. This is needed for the
new review feature we're implementing. The table includes foreign key references to
the existing recipes table. No existing data migration is needed since this is a
new feature. Please let me know when the package is updated!
```

**3. After Package Update:**

```bash
npm update @haygrouve/db-schema
```

**4. Use in Code:**

```typescript
import { recipes_recipe_reviews } from '@haygrouve/db-schema';
import { db } from '@/lib/db';

// Now you can use the new table
const reviews = await db.select().from(recipes_recipe_reviews);
```

## Best Practices

### Schema Design

- **Use consistent naming** with the `recipes_` prefix for all tables
- **Include proper indexes** for commonly queried fields
- **Add foreign key constraints** with appropriate cascade rules
- **Use appropriate data types** and constraints for data integrity

### Documentation

- **Be specific** about the schema changes needed
- **Include context** about why the change is necessary
- **Document any breaking changes** that might affect other projects
- **Provide migration notes** if existing data needs to be handled

### Communication

- **Plan ahead** for schema changes when possible
- **Communicate urgency** if the change is blocking development
- **Confirm receipt** of schema change requests
- **Test thoroughly** after package updates

## Troubleshooting

### Package Update Issues

If you encounter issues after updating the package:

1. **Clear node_modules** and reinstall:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check TypeScript compilation** for any type errors

3. **Verify imports** are using the correct table names

4. **Check database connection** is working with the new schema

### Schema Conflicts

If there are conflicts with other projects:

1. **Review the conflict** with the package maintainer
2. **Consider alternative approaches** that don't conflict
3. **Discuss table naming** or structure modifications
4. **Plan coordinated updates** if multiple projects are affected

## Contact Information

For schema change requests or questions about the workflow:

- **Package Maintainer**: [Your contact information]
- **Emergency Contact**: [Alternative contact for urgent issues]
- **Documentation**: This file and `database_setup.md`

## Version History

Track major schema changes and package versions:

| Version | Date    | Changes                    | Notes                      |
| ------- | ------- | -------------------------- | -------------------------- |
| 2.0.3   | Current | Initial RecipeShare schema | Base tables for recipe app |

---

_This workflow ensures consistent, conflict-free schema management across all projects using the shared database._

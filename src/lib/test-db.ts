// Test file to verify database connection and schema import works correctly
import { db, users, recipes } from './db';

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');

    // Test basic connection
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);

    // Test schema imports
    console.log('✅ Schema imported successfully');
    console.log('Users table available:', !!users);
    console.log('Recipes table available:', !!recipes);

    // Test a simple query (will work when DATABASE_URL is configured)
    // const userCount = await db.select().from(users).limit(1);
    // console.log('✅ Query test successful');

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

// Example usage of imported tables
export async function exampleUsage() {
  // These will work once DATABASE_URL is properly configured:

  // Get all users
  // const allUsers = await db.select().from(users);

  // Get user by Clerk ID
  // const user = await db.select().from(users).where(eq(users.clerkId, 'clerk_id_here'));

  // Get recipes with user info
  // const recipesWithUsers = await db
  //   .select()
  //   .from(recipes)
  //   .leftJoin(users, eq(recipes.userId, users.id));

  console.log(
    'Example usage ready - uncomment queries when DATABASE_URL is configured'
  );
}

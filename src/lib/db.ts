import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@haygrouve/db-schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // You can add more config here if needed
});

export const db = drizzle(pool, { schema });

// Example usage:
// const users = await db.select().from(schema.users);

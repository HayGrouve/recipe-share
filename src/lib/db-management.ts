import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@haygrouve/db-schema';

// Connection pool configuration for production
const createConnection = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  // Configure connection pool settings for production
  const poolConfig = {
    max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum connections
    idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '20'), // Idle timeout in seconds
    connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10'), // Connect timeout in seconds
    prepare: false, // Disable prepared statements for better compatibility
    transform: {
      undefined: null, // Transform undefined to null for PostgreSQL compatibility
    },
    // Enable connection validation
    onnotice: process.env.NODE_ENV === 'development' ? console.log : undefined,
  };

  return postgres(connectionString, poolConfig);
};

// Global connection instance for the application
let sql: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export const getDb = () => {
  if (!db) {
    sql = createConnection();
    db = drizzle(sql, { schema });
  }
  return db;
};

export const closeDb = async () => {
  if (sql) {
    await sql.end();
    sql = null;
    db = null;
  }
};

// Database health check utility
export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  connectionCount: number;
  lastCheck: string;
  errors?: string[];
}

export const checkDatabaseHealth = async (): Promise<DatabaseHealth> => {
  const startTime = Date.now();
  const errors: string[] = [];
  let status: DatabaseHealth['status'] = 'healthy';

  try {
    if (!sql) {
      // Initialize connection if not available
      getDb();
      if (!sql) {
        throw new Error('Failed to initialize database connection');
      }
    }

    // Basic connectivity test using raw SQL connection
    const testQuery = 'SELECT 1 as test';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sql as any)(testQuery);

    // Check connection count
    const connectionQuery = `
      SELECT count(*) as count 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `;
    const connectionResult = await sql(connectionQuery);

    const connectionCount = Number(connectionResult[0]?.count || 0);
    const responseTime = Date.now() - startTime;

    // Determine health status based on response time and connection count
    if (responseTime > 5000) {
      status = 'unhealthy';
      errors.push(`High response time: ${responseTime}ms`);
    } else if (responseTime > 1000 || connectionCount > 50) {
      status = 'degraded';
      if (responseTime > 1000)
        errors.push(`Slow response time: ${responseTime}ms`);
      if (connectionCount > 50)
        errors.push(`High connection count: ${connectionCount}`);
    }

    return {
      status,
      responseTime,
      connectionCount,
      lastCheck: new Date().toISOString(),
      ...(errors.length > 0 && { errors }),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      connectionCount: 0,
      lastCheck: new Date().toISOString(),
      errors: [
        error instanceof Error ? error.message : 'Unknown database error',
      ],
    };
  }
};

// Database metrics collection
export interface DatabaseMetrics {
  tableStats: Array<{
    tableName: string;
    rowCount: number;
    tableSize: string;
    indexSize: string;
  }>;
  connectionStats: {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
  };
  performanceStats: {
    slowQueries: number;
    cacheHitRatio: number;
    blockedQueries: number;
  };
  timestamp: string;
}

export const getDatabaseMetrics = async (): Promise<DatabaseMetrics> => {
  try {
    if (!sql) {
      getDb(); // Initialize connection
      if (!sql) throw new Error('Database connection not available');
    }

    // Get table statistics
    const tableStatsQuery = `
      SELECT 
        schemaname,
        tablename,
        n_tup_ins + n_tup_upd + n_tup_del as total_operations,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;

    const tableStats = await sql(tableStatsQuery);

    // Get connection statistics
    const connectionStatsQuery = `
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database();
    `;

    const connectionStats = await sql(connectionStatsQuery);

    // Get performance statistics
    const performanceStatsQuery = `
      SELECT 
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 seconds') as slow_queries,
        (SELECT CASE WHEN sum(blks_hit) + sum(blks_read) = 0 THEN 0 ELSE round(sum(blks_hit) * 100.0 / (sum(blks_hit) + sum(blks_read)), 2) END FROM pg_stat_database WHERE datname = current_database()) as cache_hit_ratio,
        (SELECT count(*) FROM pg_stat_activity WHERE wait_event_type = 'Lock') as blocked_queries;
    `;

    const performanceStats = await sql(performanceStatsQuery);

    interface ConnectionStat {
      total_connections: string | number;
      active_connections: string | number;
      idle_connections: string | number;
    }

    interface PerformanceStat {
      slow_queries: string | number;
      cache_hit_ratio: string | number;
      blocked_queries: string | number;
    }

    const connectionStat = connectionStats[0] as ConnectionStat;
    const performanceStat = performanceStats[0] as PerformanceStat;

    return {
      tableStats: tableStats.map((stat: unknown) => {
        const tableStat = stat as {
          tablename: string;
          total_operations: string;
          table_size: string;
          index_size: string;
        };
        return {
          tableName: tableStat.tablename,
          rowCount: parseInt(tableStat.total_operations || '0'),
          tableSize: tableStat.table_size,
          indexSize: tableStat.index_size,
        };
      }),
      connectionStats: {
        totalConnections: parseInt(
          connectionStat?.total_connections?.toString() || '0'
        ),
        activeConnections: parseInt(
          connectionStat?.active_connections?.toString() || '0'
        ),
        idleConnections: parseInt(
          connectionStat?.idle_connections?.toString() || '0'
        ),
      },
      performanceStats: {
        slowQueries: parseInt(performanceStat?.slow_queries?.toString() || '0'),
        cacheHitRatio: parseFloat(
          performanceStat?.cache_hit_ratio?.toString() || '0'
        ),
        blockedQueries: parseInt(
          performanceStat?.blocked_queries?.toString() || '0'
        ),
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(
      `Failed to collect database metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

// Backup verification utility
export const verifyBackup = async (backupPath: string): Promise<boolean> => {
  try {
    const fs = await import('fs/promises');

    // Check if backup file exists
    await fs.access(backupPath);

    // Read and parse backup file
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    const backup = JSON.parse(backupContent);

    // Verify backup structure
    const requiredFields = ['timestamp', 'recipes', 'users'];
    const hasRequiredFields = requiredFields.every((field) => field in backup);

    // Verify backup is not empty
    const hasData = backup.recipes?.length > 0 || backup.users?.length > 0;

    return hasRequiredFields && hasData;
  } catch (error) {
    console.error('Backup verification failed:', error);
    return false;
  }
};

// Database cleanup utilities
export const cleanupOldData = async (daysOld: number = 30) => {
  try {
    if (!sql) {
      getDb(); // Initialize connection
      if (!sql) throw new Error('Database connection not available');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Clean up old analytics data (if table exists)
    try {
      await sql`
        DELETE FROM analytics 
        WHERE created_at < ${cutoffDate.toISOString()}
      `;
      console.log(`Cleaned up analytics data older than ${daysOld} days`);
    } catch (error: unknown) {
      const pgError = error as { code?: string };
      if (pgError.code !== '42P01') {
        // Table doesn't exist error
        throw error;
      }
      console.log('Analytics table does not exist, skipping cleanup');
    }

    // Clean up expired sessions (if table exists)
    try {
      await sql`
        DELETE FROM user_sessions 
        WHERE expires_at < ${new Date().toISOString()}
      `;
      console.log('Cleaned up expired user sessions');
    } catch (error: unknown) {
      const pgError = error as { code?: string };
      if (pgError.code !== '42P01') {
        // Table doesn't exist error
        throw error;
      }
      console.log('User sessions table does not exist, skipping cleanup');
    }
  } catch (error) {
    console.error('Database cleanup failed:', error);
    throw error;
  }
};

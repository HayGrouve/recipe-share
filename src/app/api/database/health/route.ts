import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export interface DatabaseHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    connectivity: {
      status: 'pass' | 'fail';
      responseTime: number;
      error?: string;
    };
    connectionPool: {
      status: 'pass' | 'warn' | 'fail';
      activeConnections: number;
      error?: string;
    };
    diskSpace: {
      status: 'pass' | 'warn' | 'fail';
      usage: string;
      available: string;
      error?: string;
    };
  };
  environment: string;
  uptime: number;
}

export async function GET() {
  const startTime = Date.now();

  try {
    const healthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        connectivity: {
          status: 'pass',
          responseTime: 0,
        },
        connectionPool: {
          status: 'pass',
          activeConnections: 0,
        },
      },
      environment: process.env.NODE_ENV || 'unknown',
      uptime: process.uptime() * 1000, // Convert to milliseconds
    };

    // Test database connectivity
    try {
      const connectivityStart = Date.now();
      await db.execute('SELECT 1 as test');
      const connectivityTime = Date.now() - connectivityStart;

      healthResponse.checks.connectivity = {
        status: connectivityTime < 1000 ? 'pass' : 'fail',
        responseTime: connectivityTime,
      };

      if (connectivityTime > 1000) {
        healthResponse.status = 'degraded';
      }
    } catch (error) {
      console.error('Database connectivity check failed:', error);
      healthResponse.checks.connectivity = {
        status: 'fail',
        responseTime: Date.now() - startTime,
      };
      healthResponse.status = 'unhealthy';
    }

    // Check connection pool status
    if (healthResponse.checks.connectivity.status === 'pass') {
      try {
        const connectionQuery = `
          SELECT count(*) as count 
          FROM pg_stat_activity 
          WHERE state = 'active'
        `;

        const result = await db.execute(connectionQuery);
        const activeConnections = Number(result[0]?.count || 0);

        healthResponse.checks.connectionPool = {
          status:
            activeConnections > 50
              ? 'fail'
              : activeConnections > 20
                ? 'warn'
                : 'pass',
          activeConnections,
        };
      } catch (connectionError) {
        console.error('Connection pool check failed:', connectionError);
        healthResponse.checks.connectionPool = {
          status: 'fail',
          activeConnections: 0,
        };
      }
    }

    return NextResponse.json(healthResponse, {
      status: healthResponse.status === 'unhealthy' ? 503 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'database',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'database',
          'X-Response-Time': `${Date.now() - startTime}ms`,
        },
      }
    );
  }
}

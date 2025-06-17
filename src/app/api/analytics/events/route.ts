import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Analytics event validation schema
const AnalyticsEventSchema = z.object({
  name: z.string().min(1).max(100),
  properties: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
  userId: z.string().optional(),
  sessionId: z.string().min(1).max(100),
  timestamp: z.string().datetime(),
  url: z.string().url().optional(),
  userAgent: z.string().max(500).optional(),
  referrer: z.string().url().optional(),
});

type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// Rate limiting map (in-memory, in production would use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const existing = rateLimitMap.get(identifier);

  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  existing.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(clientIP, 100, 60000)) {
      logger.warn('Analytics rate limit exceeded', {
        ip: clientIP,
        url: request.url,
      });

      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = AnalyticsEventSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn(
        'Invalid analytics event received',
        {
          ip: clientIP,
          url: request.url,
        },
        {
          errors: validationResult.error.errors,
          body,
        }
      );

      return NextResponse.json(
        { error: 'Invalid event data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const event: AnalyticsEvent = validationResult.data;

    // Additional privacy checks
    if (event.properties) {
      // Remove any potentially sensitive properties
      const sanitizedProperties = sanitizeProperties(event.properties);
      event.properties = sanitizedProperties;
    }

    // Store the event (in production, this would go to your analytics database)
    await storeAnalyticsEvent(event, request);

    const duration = Date.now() - startTime;

    logger.info('Analytics event processed', {
      eventName: event.name,
      userId: event.userId,
      sessionId: event.sessionId,
      duration,
    });

    return NextResponse.json(
      { success: true, eventId: generateEventId() },
      {
        status: 200,
        headers: {
          'X-Processing-Time': `${duration}ms`,
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(
      'Failed to process analytics event',
      error instanceof Error ? error : undefined,
      {
        url: request.url,
        method: request.method,
        duration,
      }
    );

    return NextResponse.json(
      { error: 'Failed to process event' },
      {
        status: 500,
        headers: {
          'X-Processing-Time': `${duration}ms`,
        },
      }
    );
  }
}

async function storeAnalyticsEvent(
  event: AnalyticsEvent,
  request: NextRequest
): Promise<void> {
  // In production, you would store this in your analytics database
  // For now, we'll just log it in a structured format

  const analyticsRecord = {
    event_name: event.name,
    properties: event.properties || {},
    user_id: event.userId,
    session_id: event.sessionId,
    timestamp: event.timestamp,
    url: event.url,
    user_agent: event.userAgent,
    referrer: event.referrer,
    ip_address:
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown',
    created_at: new Date().toISOString(),
  };

  // Log the analytics event for collection by log aggregation services
  logger.info(
    'Analytics event recorded',
    {
      eventName: event.name,
      userId: event.userId,
      sessionId: event.sessionId,
    },
    {
      analyticsData: analyticsRecord,
    }
  );

  // In a real implementation, you might:
  // 1. Store in a time-series database like InfluxDB
  // 2. Send to Google Analytics 4 via Measurement Protocol
  // 3. Store in your main database for business analytics
  // 4. Send to a dedicated analytics service like Mixpanel or Amplitude

  // Example: Store in database (commented out as we don't have a table for this)
  // try {
  //   await db.insert(analyticsEvents).values(analyticsRecord);
  // } catch (error) {
  //   logger.error('Failed to store analytics event in database', error);
  // }
}

function sanitizeProperties(
  properties: Record<string, string | number | boolean>
): Record<string, string | number | boolean> {
  const sanitized: Record<string, string | number | boolean> = {};

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'auth',
    'email',
    'phone',
    'address',
    'credit_card',
    'ssn',
    'social_security',
    'passport',
  ];

  for (const [key, value] of Object.entries(properties)) {
    // Skip sensitive keys
    if (
      sensitiveKeys.some((sensitiveKey) =>
        key.toLowerCase().includes(sensitiveKey)
      )
    ) {
      continue;
    }

    // Sanitize string values
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function sanitizeString(value: string): string {
  // Remove potential PII patterns
  return value
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]');
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'analytics-events',
    timestamp: new Date().toISOString(),
  });
}

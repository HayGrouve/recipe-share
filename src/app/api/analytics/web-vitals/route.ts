import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

interface WebVitalData {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  url: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const data: WebVitalData = await request.json();

    // Validate the data
    if (!data.name || typeof data.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid web vitals data' },
        { status: 400 }
      );
    }

    // In a real application, you would store this data in your database
    // For now, we'll log it to the console
    console.log('[Web Vitals]', {
      userId: user?.id || 'anonymous',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date(data.timestamp).toISOString(),
      metric: data.name,
      value: data.value,
      rating: data.rating,
      url: data.url,
      sessionId: data.id,
    });

    // Example: Store in database (commented out)
    /*
    await db.insert(webVitalsMetrics).values({
      userId: user?.id,
      metricName: data.name,
      metricValue: data.value,
      rating: data.rating,
      url: data.url,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date(data.timestamp),
      sessionId: data.id,
    });
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing web vitals data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

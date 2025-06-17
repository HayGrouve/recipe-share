import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting map
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_MAX = 100; // max requests per window
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds

// Create route matcher for public routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/recipes',
  '/recipes/(.*)',
  '/api/health',
  '/api/recipes',
  '/api/recipes/(.*)',
  '/api/search',
  '/api/analytics/web-vitals',
  '/api/webhooks/(.*)',
  '/api/uploadthing(.*)',
  '/sitemap.xml',
  '/robots.txt',
  '/manifest.json',
  '/offline',
  '/sw.js',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'anonymous'
  );
}

function applyRateLimit(request: NextRequest): boolean {
  const ip = getClientIP(request);
  const now = Date.now();
  const userLimit = rateLimit.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }

  userLimit.count++;
  return true;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Additional security headers not covered by next.config.mjs
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  return response;
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!applyRateLimit(request)) {
      return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '900', // 15 minutes
        },
      });
    }
  }

  // Block suspicious user agents for API routes
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper'];
  const isBot = suspiciousAgents.some((agent) => userAgent.includes(agent));

  // Allow legitimate search engine bots
  const legitimateBots = ['googlebot', 'bingbot', 'slurp', 'duckduckbot'];
  const isLegitimateBot = legitimateBots.some((bot) => userAgent.includes(bot));

  if (
    isBot &&
    !isLegitimateBot &&
    request.nextUrl.pathname.startsWith('/api/')
  ) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Protect non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Add security headers to response
  const response = NextResponse.next();
  return addSecurityHeaders(response);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

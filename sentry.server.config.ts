import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment configuration
  environment: process.env.NODE_ENV || 'development',

  // Server-side performance monitoring
  integrations: [
    Sentry.httpIntegration({
      // Capture outgoing HTTP requests
      breadcrumbs: true,
    }),
    Sentry.prismaIntegration({
      // If using Prisma, capture database operations
    }),
  ],

  // Performance traces sample rate
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture unhandled promise rejections
  captureUnhandledRejections: true,

  // Enhanced error context for server-side
  beforeSend(event) {
    // Filter out common development errors
    if (process.env.NODE_ENV === 'development') {
      // Skip database connection errors during hot reload
      if (event.exception?.values?.[0]?.value?.includes('connection')) {
        return null;
      }
    }

    // Add server context
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
        delete event.request.headers['x-api-key'];
      }

      // Remove sensitive query parameters
      if (event.request.query_string) {
        event.request.query_string = event.request.query_string
          .replace(/password=[^&]*/g, 'password=[REDACTED]')
          .replace(/token=[^&]*/g, 'token=[REDACTED]');
      }
    }

    return event;
  },

  // Privacy controls for server-side breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Don't capture sensitive data in breadcrumbs
    if (breadcrumb.category === 'http' && breadcrumb.data?.url) {
      // Remove sensitive query parameters from URLs
      breadcrumb.data.url = breadcrumb.data.url
        .replace(/password=[^&]*/g, 'password=[REDACTED]')
        .replace(/token=[^&]*/g, 'token=[REDACTED]');
    }

    return breadcrumb;
  },

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,

  // Server name for identification
  serverName: process.env.VERCEL_REGION || 'local',
});

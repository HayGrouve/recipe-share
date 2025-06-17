import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment configuration
  environment: process.env.NODE_ENV || 'development',

  // Edge runtime has limited integrations
  integrations: [
    // Only basic integrations are supported in edge runtime
  ],

  // Performance traces sample rate
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Enhanced error context for edge runtime
  beforeSend(event) {
    // Filter out common edge runtime errors
    if (process.env.NODE_ENV === 'development') {
      // Skip common edge runtime warnings
      if (event.exception?.values?.[0]?.value?.includes('edge runtime')) {
        return null;
      }
    }

    // Add edge context
    if (event.request) {
      // Remove sensitive headers in edge runtime
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
    }

    // Add edge runtime identifier
    event.tags = {
      ...event.tags,
      runtime: 'edge',
    };

    return event;
  },

  // Privacy controls for edge runtime
  beforeBreadcrumb(breadcrumb) {
    // Limit breadcrumb data in edge runtime
    if (breadcrumb.category === 'http' && breadcrumb.data?.url) {
      // Remove sensitive parameters
      breadcrumb.data.url = breadcrumb.data.url
        .replace(/password=[^&]*/g, 'password=[REDACTED]')
        .replace(/token=[^&]*/g, 'token=[REDACTED]');
    }

    return breadcrumb;
  },

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,

  // Edge runtime identifier
  serverName: 'edge-runtime',
});

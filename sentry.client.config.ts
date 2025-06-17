import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment configuration
  environment: process.env.NODE_ENV || 'development',

  // Performance monitoring
  integrations: [
    Sentry.replayIntegration({
      // Capture 10% of all sessions
      sessionSampleRate: 0.1,
      // Capture 100% of sessions with an error
      errorSampleRate: 1.0,
    }),
    Sentry.browserTracingIntegration({
      // Capture interactions like clicks, form submissions, and navigation
      enableInp: true,
    }),
  ],

  // Performance traces sample rate
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay sample rate
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  // Capture unhandled promise rejections
  captureUnhandledRejections: true,

  // Enhanced error context
  beforeSend(event) {
    // Filter out development errors we don't want to track
    if (process.env.NODE_ENV === 'development') {
      // Skip hydration errors in development
      if (event.exception?.values?.[0]?.value?.includes('Hydration')) {
        return null;
      }
    }

    // Add user context if available
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      if (userId) {
        Sentry.setUser({ id: userId });
      }
    }

    return event;
  },

  // Privacy controls
  beforeBreadcrumb(breadcrumb) {
    // Don't capture sensitive form data
    if (
      breadcrumb.category === 'ui.input' &&
      breadcrumb.message?.includes('password')
    ) {
      return null;
    }
    return breadcrumb;
  },

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
});

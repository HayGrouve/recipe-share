import { logger } from './logger';

// Privacy-compliant analytics events
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  url?: string;
  userAgent?: string;
  referrer?: string;
}

// User consent management
export interface UserConsent {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: string;
}

class Analytics {
  private consentGiven: boolean = false;
  private sessionId: string;
  private userId?: string;
  private isInitialized: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();

    if (typeof window !== 'undefined') {
      this.initializeClient();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeClient(): void {
    // Check for existing consent
    const savedConsent = localStorage.getItem('user-consent');
    if (savedConsent) {
      try {
        const consent: UserConsent = JSON.parse(savedConsent);
        this.consentGiven = consent.analytics;
      } catch (error) {
        logger.warn('Failed to parse stored user consent', {}, { error });
      }
    }

    // Get user ID if available (from auth system)
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = storedUserId;
    }

    this.isInitialized = true;

    // Track page view on initialization
    this.trackPageView();
  }

  // Consent management
  setConsent(consent: Partial<UserConsent>): void {
    const fullConsent: UserConsent = {
      analytics: consent.analytics || false,
      marketing: consent.marketing || false,
      preferences: consent.preferences || false,
      timestamp: new Date().toISOString(),
    };

    this.consentGiven = fullConsent.analytics;

    if (typeof window !== 'undefined') {
      localStorage.setItem('user-consent', JSON.stringify(fullConsent));
    }

    logger.info(
      'User consent updated',
      {
        userId: this.userId,
      },
      {
        consent: fullConsent,
      }
    );
  }

  getConsent(): UserConsent | null {
    if (typeof window === 'undefined') return null;

    const savedConsent = localStorage.getItem('user-consent');
    if (!savedConsent) return null;

    try {
      return JSON.parse(savedConsent);
    } catch {
      return null;
    }
  }

  // User identification
  identify(
    userId: string,
    properties?: Record<string, string | number | boolean>
  ): void {
    this.userId = userId;

    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
    }

    if (this.consentGiven) {
      this.track('user_identified', {
        ...properties,
        first_time: !this.getConsent(),
      });
    }

    logger.info(
      'User identified for analytics',
      {
        userId,
      },
      properties
    );
  }

  // Event tracking
  track(
    eventName: string,
    properties?: Record<string, string | number | boolean>
  ): void {
    if (!this.consentGiven) {
      logger.debug(
        'Analytics event skipped - no consent',
        {},
        { eventName, properties }
      );
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: this.sanitizeProperties(properties),
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof window !== 'undefined' ? navigator.userAgent : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    };

    this.sendEvent(event);
  }

  // Page view tracking
  trackPageView(url?: string): void {
    if (!this.isInitialized || !this.consentGiven) return;

    const pageUrl =
      url ||
      (typeof window !== 'undefined' ? window.location.pathname : undefined);

    this.track('page_view', {
      page: pageUrl || 'unknown',
      title: typeof window !== 'undefined' ? document.title : undefined,
    });
  }

  // Recipe-specific events
  trackRecipeView(
    recipeId: string,
    properties?: Record<string, string | number | boolean>
  ): void {
    this.track('recipe_viewed', {
      recipe_id: recipeId,
      ...properties,
    });
  }

  trackRecipeCreated(
    recipeId: string,
    properties?: Record<string, string | number | boolean>
  ): void {
    this.track('recipe_created', {
      recipe_id: recipeId,
      ...properties,
    });
  }

  trackRecipeSaved(
    recipeId: string,
    properties?: Record<string, string | number | boolean>
  ): void {
    this.track('recipe_saved', {
      recipe_id: recipeId,
      ...properties,
    });
  }

  trackRecipeShared(recipeId: string, method: string): void {
    this.track('recipe_shared', {
      recipe_id: recipeId,
      share_method: method,
    });
  }

  trackSearch(query: string, resultsCount: number): void {
    this.track('search_performed', {
      query: query.length > 100 ? query.substring(0, 100) + '...' : query,
      results_count: resultsCount,
    });
  }

  // User engagement events
  trackUserEngagement(
    action: string,
    properties?: Record<string, string | number | boolean>
  ): void {
    this.track('user_engagement', {
      action,
      ...properties,
    });
  }

  // Error tracking (privacy-safe)
  trackError(
    errorType: string,
    message: string,
    properties?: Record<string, string | number | boolean>
  ): void {
    // Remove any potentially sensitive information
    const sanitizedMessage = this.sanitizeErrorMessage(message);

    this.track('error_occurred', {
      error_type: errorType,
      error_message: sanitizedMessage,
      ...properties,
    });
  }

  // Performance tracking
  trackPerformance(
    metric: string,
    value: number,
    properties?: Record<string, string | number | boolean>
  ): void {
    this.track('performance_metric', {
      metric_name: metric,
      metric_value: value,
      ...properties,
    });
  }

  private sanitizeProperties(
    properties?: Record<string, string | number | boolean>
  ): Record<string, string | number | boolean> | undefined {
    if (!properties) return undefined;

    const sanitized: Record<string, string | number | boolean> = {};

    for (const [key, value] of Object.entries(properties)) {
      // Skip sensitive keys
      if (this.isSensitiveKey(key)) continue;

      // Sanitize string values
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
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

    return sensitiveKeys.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey)
    );
  }

  private sanitizeString(value: string): string {
    // Remove potential PII patterns
    return value
      .replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        '[EMAIL]'
      )
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]');
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove sensitive information from error messages
    return message
      .replace(/password/gi, '[REDACTED]')
      .replace(/token/gi, '[REDACTED]')
      .replace(/key/gi, '[REDACTED]')
      .replace(/secret/gi, '[REDACTED]')
      .replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        '[EMAIL]'
      );
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Send to our analytics endpoint
      if (typeof window !== 'undefined') {
        await fetch('/api/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
      }

      logger.debug(
        'Analytics event sent',
        {
          eventName: event.name,
          userId: event.userId,
        },
        {
          properties: event.properties,
        }
      );
    } catch (error) {
      logger.warn(
        'Failed to send analytics event',
        {
          eventName: event.name,
        },
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  // Cleanup method
  reset(): void {
    this.userId = undefined;
    this.sessionId = this.generateSessionId();
    this.consentGiven = false;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
      localStorage.removeItem('user-consent');
    }

    logger.info('Analytics reset');
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export default for convenience
export default analytics;

import * as Sentry from '@sentry/nextjs';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
  metadata?: Record<string, unknown>;
}

class Logger {
  private environment: string;
  private isDevelopment: boolean;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.isDevelopment = this.environment === 'development';
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
    metadata?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      metadata,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;

    // In production, skip debug logs
    if (level === 'debug') return false;

    return true;
  }

  private outputLog(logEntry: LogEntry): void {
    if (!this.shouldLog(logEntry.level)) return;

    if (this.isDevelopment) {
      // Development: Colorized console output
      const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m', // Green
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
        fatal: '\x1b[35m', // Magenta
      };
      const reset = '\x1b[0m';

      const color = colors[logEntry.level];
      const prefix = `${color}[${logEntry.level.toUpperCase()}]${reset}`;
      const timestamp = `\x1b[90m${logEntry.timestamp}${reset}`;

      console.log(`${prefix} ${timestamp} ${logEntry.message}`);

      if (logEntry.context) {
        console.log('  Context:', logEntry.context);
      }

      if (logEntry.metadata) {
        console.log('  Metadata:', logEntry.metadata);
      }

      if (logEntry.error) {
        console.error('  Error:', logEntry.error);
      }
    } else {
      // Production: Structured JSON output
      console.log(JSON.stringify(logEntry));
    }

    // Send to Sentry for error levels
    if (logEntry.level === 'error' || logEntry.level === 'fatal') {
      if (logEntry.error) {
        Sentry.captureException(logEntry.error, {
          level: logEntry.level === 'fatal' ? 'fatal' : 'error',
          contexts: {
            logger: logEntry.context || {},
          },
          extra: logEntry.metadata,
        });
      } else {
        Sentry.captureMessage(logEntry.message, {
          level: logEntry.level === 'fatal' ? 'fatal' : 'error',
          contexts: {
            logger: logEntry.context || {},
          },
          extra: logEntry.metadata,
        });
      }
    }

    // Send warnings to Sentry in production
    if (logEntry.level === 'warn' && !this.isDevelopment) {
      Sentry.captureMessage(logEntry.message, {
        level: 'warning',
        contexts: {
          logger: logEntry.context || {},
        },
        extra: logEntry.metadata,
      });
    }
  }

  debug(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>
  ): void {
    const logEntry = this.formatLogEntry(
      'debug',
      message,
      context,
      undefined,
      metadata
    );
    this.outputLog(logEntry);
  }

  info(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>
  ): void {
    const logEntry = this.formatLogEntry(
      'info',
      message,
      context,
      undefined,
      metadata
    );
    this.outputLog(logEntry);
  }

  warn(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>
  ): void {
    const logEntry = this.formatLogEntry(
      'warn',
      message,
      context,
      undefined,
      metadata
    );
    this.outputLog(logEntry);
  }

  error(
    message: string,
    error?: Error,
    context?: LogContext,
    metadata?: Record<string, unknown>
  ): void {
    const logEntry = this.formatLogEntry(
      'error',
      message,
      context,
      error,
      metadata
    );
    this.outputLog(logEntry);
  }

  fatal(
    message: string,
    error?: Error,
    context?: LogContext,
    metadata?: Record<string, unknown>
  ): void {
    const logEntry = this.formatLogEntry(
      'fatal',
      message,
      context,
      error,
      metadata
    );
    this.outputLog(logEntry);
  }

  // Convenience methods for common logging scenarios
  request(
    message: string,
    req: {
      method: string;
      url: string;
      headers: Record<string, string | string[] | undefined>;
    },
    metadata?: Record<string, unknown>
  ): void {
    const context: LogContext = {
      method: req.method,
      url: req.url,
      userAgent: Array.isArray(req.headers['user-agent'])
        ? req.headers['user-agent'][0]
        : req.headers['user-agent'],
      ip: this.getClientIP(req.headers),
    };

    this.info(`Request: ${message}`, context, metadata);
  }

  response(
    message: string,
    req: { method: string; url: string },
    statusCode: number,
    duration: number,
    metadata?: Record<string, unknown>
  ): void {
    const context: LogContext = {
      method: req.method,
      url: req.url,
      statusCode,
      duration,
    };

    const level =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    if (level === 'error') {
      this.error(`Response: ${message}`, undefined, context, metadata);
    } else if (level === 'warn') {
      this.warn(`Response: ${message}`, context, metadata);
    } else {
      this.info(`Response: ${message}`, context, metadata);
    }
  }

  database(
    message: string,
    operation: string,
    table?: string,
    duration?: number,
    metadata?: Record<string, unknown>
  ): void {
    const context: LogContext = {
      operation,
      table,
      duration,
    };

    this.info(`Database: ${message}`, context, metadata);
  }

  auth(
    message: string,
    userId?: string,
    action?: string,
    metadata?: Record<string, unknown>
  ): void {
    const context: LogContext = {
      userId,
      action,
    };

    this.info(`Auth: ${message}`, context, metadata);
  }

  private getClientIP(
    headers: Record<string, string | string[] | undefined>
  ): string | undefined {
    // Check various headers for client IP
    const forwarded = headers['x-forwarded-for'];
    const realIP = headers['x-real-ip'];
    const cfConnectingIP = headers['cf-connecting-ip'];

    if (forwarded) {
      const forwardedIP = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return forwardedIP.split(',')[0]?.trim();
    }

    if (realIP) {
      return Array.isArray(realIP) ? realIP[0] : realIP;
    }

    if (cfConnectingIP) {
      return Array.isArray(cfConnectingIP) ? cfConnectingIP[0] : cfConnectingIP;
    }

    return undefined;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;

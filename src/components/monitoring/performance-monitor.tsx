'use client';

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

interface PerformanceMetrics {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export default function PerformanceMonitor() {
  const hasReported = useRef(false);

  useEffect(() => {
    // Only run in browser and once per page load
    if (typeof window === 'undefined' || hasReported.current) return;

    const reportPerformanceMetrics = () => {
      try {
        // Core Web Vitals and other performance metrics
        const metrics: PerformanceMetrics[] = [];

        // First Contentful Paint (FCP)
        const fcpEntries = performance.getEntriesByName(
          'first-contentful-paint'
        );
        if (fcpEntries.length > 0) {
          const fcp = fcpEntries[0] as PerformanceEntry;
          const fcpValue = fcp.startTime;
          metrics.push({
            name: 'FCP',
            value: fcpValue,
            rating:
              fcpValue <= 1800
                ? 'good'
                : fcpValue <= 3000
                  ? 'needs-improvement'
                  : 'poor',
          });
        }

        // Largest Contentful Paint (LCP)
        const lcpEntries = performance.getEntriesByType(
          'largest-contentful-paint'
        );
        if (lcpEntries.length > 0) {
          const lcp = lcpEntries[lcpEntries.length - 1] as PerformanceEntry;
          const lcpValue = lcp.startTime;
          metrics.push({
            name: 'LCP',
            value: lcpValue,
            rating:
              lcpValue <= 2500
                ? 'good'
                : lcpValue <= 4000
                  ? 'needs-improvement'
                  : 'poor',
          });
        }

        // Time to First Byte (TTFB)
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const nav = navigationEntries[0] as PerformanceNavigationTiming;
          const ttfb = nav.responseStart - nav.requestStart;
          metrics.push({
            name: 'TTFB',
            value: ttfb,
            rating:
              ttfb <= 800
                ? 'good'
                : ttfb <= 1800
                  ? 'needs-improvement'
                  : 'poor',
          });

          // Total page load time
          const loadTime = nav.loadEventEnd - nav.navigationStart;
          if (loadTime > 0) {
            metrics.push({
              name: 'Load Time',
              value: loadTime,
              rating:
                loadTime <= 2000
                  ? 'good'
                  : loadTime <= 4000
                    ? 'needs-improvement'
                    : 'poor',
            });
          }

          // DOM Content Loaded
          const domContentLoaded =
            nav.domContentLoadedEventEnd - nav.navigationStart;
          if (domContentLoaded > 0) {
            metrics.push({
              name: 'DOM Content Loaded',
              value: domContentLoaded,
              rating:
                domContentLoaded <= 1500
                  ? 'good'
                  : domContentLoaded <= 3000
                    ? 'needs-improvement'
                    : 'poor',
            });
          }
        }

        // Resource loading performance
        const resourceEntries = performance.getEntriesByType('resource');
        const slowResources = resourceEntries.filter(
          (entry) => entry.duration > 1000
        );

        if (slowResources.length > 0) {
          logger.warn(
            'Slow resource loading detected',
            {
              url: window.location.pathname,
            },
            {
              slowResourceCount: slowResources.length,
              slowestResource: {
                name: slowResources[0].name,
                duration: slowResources[0].duration,
              },
            }
          );
        }

        // Memory usage (if available)
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          const memoryUsage = {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
          };

          // Log if memory usage is high
          const memoryUsagePercent =
            (memoryUsage.used / memoryUsage.limit) * 100;
          if (memoryUsagePercent > 80) {
            logger.warn(
              'High memory usage detected',
              {
                url: window.location.pathname,
              },
              {
                memoryUsage,
                memoryUsagePercent,
              }
            );
          }
        }

        // Report all metrics
        metrics.forEach((metric) => {
          logger.info('Performance metric recorded', {
            url: window.location.pathname,
            metric: metric.name,
            value: Math.round(metric.value),
            rating: metric.rating,
          });

          // Log poor performance as warnings
          if (metric.rating === 'poor') {
            logger.warn(`Poor ${metric.name} performance`, {
              url: window.location.pathname,
              metric: metric.name,
              value: Math.round(metric.value),
              threshold:
                metric.name === 'LCP'
                  ? '2500ms'
                  : metric.name === 'FCP'
                    ? '1800ms'
                    : metric.name === 'TTFB'
                      ? '800ms'
                      : 'unknown',
            });
          }
        });

        // Connection information
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          logger.info(
            'Network connection info',
            {
              url: window.location.pathname,
            },
            {
              effectiveType: connection.effectiveType,
              downlink: connection.downlink,
              rtt: connection.rtt,
              saveData: connection.saveData,
            }
          );
        }

        hasReported.current = true;
      } catch (error) {
        logger.error(
          'Failed to collect performance metrics',
          error instanceof Error ? error : undefined,
          {
            url: window.location.pathname,
          }
        );
      }
    };

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      // Small delay to ensure all metrics are available
      setTimeout(reportPerformanceMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(reportPerformanceMetrics, 1000);
      });
    }

    // Cleanup function
    return () => {
      // No cleanup needed for this component
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}

// Hook for manual performance tracking
export function usePerformanceTracking() {
  const trackCustomMetric = (
    name: string,
    value: number,
    metadata?: Record<string, unknown>
  ) => {
    logger.info(
      `Custom performance metric: ${name}`,
      {
        url:
          typeof window !== 'undefined' ? window.location.pathname : undefined,
        metric: name,
        value: Math.round(value),
      },
      metadata
    );
  };

  const trackUserTiming = (name: string, startTime?: number) => {
    const endTime = performance.now();
    const duration = startTime ? endTime - startTime : endTime;

    trackCustomMetric(name, duration, {
      type: 'user_timing',
      startTime: startTime || 0,
      endTime,
    });

    return endTime;
  };

  const startTiming = (name: string) => {
    const startTime = performance.now();
    performance.mark(`${name}-start`);

    return {
      end: () => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        return trackUserTiming(name, startTime);
      },
    };
  };

  return {
    trackCustomMetric,
    trackUserTiming,
    startTiming,
  };
}

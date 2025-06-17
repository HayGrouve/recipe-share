'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

// Analytics function that you can connect to your analytics service
function sendToAnalytics(metric: Metric) {
  // In a real application, you would send this data to your analytics service
  console.log('[Web Vitals]', metric);

  // Example: Send to Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      custom_parameter_name: 'web_vitals',
      custom_parameter_value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      ),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }

  // Example: Send to custom analytics endpoint
  if (typeof fetch !== 'undefined') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        rating: getVitalsRating(metric),
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch(console.error);
  }
}

// Rate metrics based on Core Web Vitals thresholds
function getVitalsRating(
  metric: Metric
): 'good' | 'needs-improvement' | 'poor' {
  switch (metric.name) {
    case 'LCP':
      return metric.value <= 2500
        ? 'good'
        : metric.value <= 4000
          ? 'needs-improvement'
          : 'poor';
    case 'INP':
      return metric.value <= 200
        ? 'good'
        : metric.value <= 500
          ? 'needs-improvement'
          : 'poor';
    case 'CLS':
      return metric.value <= 0.1
        ? 'good'
        : metric.value <= 0.25
          ? 'needs-improvement'
          : 'poor';
    case 'FCP':
      return metric.value <= 1800
        ? 'good'
        : metric.value <= 3000
          ? 'needs-improvement'
          : 'poor';
    case 'TTFB':
      return metric.value <= 800
        ? 'good'
        : metric.value <= 1800
          ? 'needs-improvement'
          : 'poor';
    default:
      return 'good';
  }
}

declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      parameters?: Record<string, unknown>
    ) => void;
  }
}

export function WebVitals() {
  useEffect(() => {
    // Only run in production or when explicitly enabled
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === 'true'
    ) {
      // Core Web Vitals
      onCLS(sendToAnalytics);
      onINP(sendToAnalytics);
      onLCP(sendToAnalytics);

      // Additional metrics
      onFCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
    }
  }, []);

  // This component doesn't render anything
  return null;
}

// Optional: Real-time vitals display for development
export function WebVitalsDisplay() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const vitalsData: Record<string, Metric> = {};

      const logVitals = (metric: Metric) => {
        vitalsData[metric.name] = metric;
        const rating = getVitalsRating(metric);
        const color =
          rating === 'good'
            ? '🟢'
            : rating === 'needs-improvement'
              ? '🟡'
              : '🔴';

        console.table({
          [`${color} ${metric.name}`]: {
            Value:
              metric.name === 'CLS'
                ? metric.value.toFixed(3)
                : `${Math.round(metric.value)}ms`,
            Rating: rating,
            Threshold: getThreshold(metric.name),
          },
        });
      };

      onCLS(logVitals);
      onINP(logVitals);
      onLCP(logVitals);
      onFCP(logVitals);
      onTTFB(logVitals);
    }
  }, []);

  return null;
}

function getThreshold(metricName: string): string {
  switch (metricName) {
    case 'LCP':
      return 'Good: ≤2.5s, Poor: >4s';
    case 'INP':
      return 'Good: ≤200ms, Poor: >500ms';
    case 'CLS':
      return 'Good: ≤0.1, Poor: >0.25';
    case 'FCP':
      return 'Good: ≤1.8s, Poor: >3s';
    case 'TTFB':
      return 'Good: ≤800ms, Poor: >1.8s';
    default:
      return '';
  }
}

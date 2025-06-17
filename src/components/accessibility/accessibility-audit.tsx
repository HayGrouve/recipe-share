'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Contrast,
  Keyboard,
  Volume2,
} from 'lucide-react';

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'success';
  category: 'structure' | 'contrast' | 'keyboard' | 'aria' | 'content';
  title: string;
  description: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  element?: string;
  fix?: string;
}

export function AccessibilityAudit() {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  const auditPage = () => {
    setIsAuditing(true);
    const foundIssues: AccessibilityIssue[] = [];

    // Check heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels: number[] = [];

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      headingLevels.push(level);
    });

    // Check if h1 exists
    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count === 0) {
      foundIssues.push({
        type: 'error',
        category: 'structure',
        title: 'Missing Page Title (H1)',
        description: 'Page is missing a main heading (h1) element.',
        wcagLevel: 'AA',
        element: 'h1',
        fix: 'Add a descriptive h1 element to identify the main content of the page.',
      });
    } else if (h1Count > 1) {
      foundIssues.push({
        type: 'warning',
        category: 'structure',
        title: 'Multiple H1 Elements',
        description: `Page has ${h1Count} h1 elements. Consider using only one h1 per page.`,
        wcagLevel: 'AA',
        element: 'h1',
        fix: 'Use h1 for the main page title only. Use h2-h6 for section headings.',
      });
    }

    // Check heading hierarchy
    for (let i = 0; i < headingLevels.length - 1; i++) {
      const current = headingLevels[i];
      const next = headingLevels[i + 1];

      if (next > current + 1) {
        foundIssues.push({
          type: 'warning',
          category: 'structure',
          title: 'Heading Level Skipped',
          description: `Heading jumps from h${current} to h${next}. This can confuse screen reader users.`,
          wcagLevel: 'AA',
          element: `h${next}`,
          fix: 'Use headings in sequential order (h1 → h2 → h3, etc.) without skipping levels.',
        });
        break;
      }
    }

    // Check for images without alt text
    const images = document.querySelectorAll('img');
    let missingAltCount = 0;
    images.forEach((img) => {
      if (!img.hasAttribute('alt')) {
        missingAltCount++;
      }
    });

    if (missingAltCount > 0) {
      foundIssues.push({
        type: 'error',
        category: 'content',
        title: 'Images Missing Alt Text',
        description: `${missingAltCount} image(s) found without alt attributes.`,
        wcagLevel: 'A',
        element: 'img',
        fix: 'Add descriptive alt text to all images. Use alt="" for decorative images.',
      });
    }

    // Check for form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    let unlabeledInputCount = 0;
    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel =
        input.hasAttribute('aria-label') ||
        input.hasAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel) {
        unlabeledInputCount++;
      }
    });

    if (unlabeledInputCount > 0) {
      foundIssues.push({
        type: 'error',
        category: 'aria',
        title: 'Form Controls Without Labels',
        description: `${unlabeledInputCount} form control(s) found without proper labels.`,
        wcagLevel: 'A',
        element: 'input, textarea, select',
        fix: 'Associate labels with form controls using "for" attribute or aria-label/aria-labelledby.',
      });
    }

    // Check for buttons without accessible names
    const buttons = document.querySelectorAll('button');
    let unlabeledButtonCount = 0;
    buttons.forEach((button) => {
      const hasText = button.textContent?.trim();
      const hasAriaLabel =
        button.hasAttribute('aria-label') ||
        button.hasAttribute('aria-labelledby');

      if (!hasText && !hasAriaLabel) {
        unlabeledButtonCount++;
      }
    });

    if (unlabeledButtonCount > 0) {
      foundIssues.push({
        type: 'error',
        category: 'aria',
        title: 'Buttons Without Accessible Names',
        description: `${unlabeledButtonCount} button(s) found without accessible names.`,
        wcagLevel: 'A',
        element: 'button',
        fix: 'Provide accessible names for buttons using text content or aria-label.',
      });
    }

    // Check for color contrast (simplified check for common patterns)
    const potentialLowContrastElements = document.querySelectorAll(
      '.text-gray-500, .text-gray-400, .text-gray-300'
    );
    if (potentialLowContrastElements.length > 0) {
      foundIssues.push({
        type: 'warning',
        category: 'contrast',
        title: 'Potential Color Contrast Issues',
        description: `${potentialLowContrastElements.length} element(s) with potentially low contrast colors found.`,
        wcagLevel: 'AA',
        element: 'text elements',
        fix: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text).',
      });
    }

    // Check for focus indicators
    const interactiveElements = document.querySelectorAll(
      'button, a, input, textarea, select, [tabindex]'
    );
    let noFocusIndicatorCount = 0;
    interactiveElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element, ':focus');
      const hasOutline =
        computedStyle.outline !== 'none' && computedStyle.outline !== '';
      const hasBoxShadow = computedStyle.boxShadow !== 'none';
      const hasBorder = computedStyle.borderWidth !== '0px';

      if (!hasOutline && !hasBoxShadow && !hasBorder) {
        noFocusIndicatorCount++;
      }
    });

    if (noFocusIndicatorCount > 0) {
      foundIssues.push({
        type: 'warning',
        category: 'keyboard',
        title: 'Elements Without Focus Indicators',
        description: `${noFocusIndicatorCount} interactive element(s) may lack visible focus indicators.`,
        wcagLevel: 'AA',
        element: 'interactive elements',
        fix: 'Ensure all interactive elements have visible focus indicators for keyboard navigation.',
      });
    }

    // Check for proper landmark usage
    const hasMain = document.querySelector('main, [role="main"]');
    if (!hasMain) {
      foundIssues.push({
        type: 'warning',
        category: 'structure',
        title: 'Missing Main Landmark',
        description:
          'Page is missing a main landmark to identify the primary content.',
        wcagLevel: 'AA',
        element: 'main',
        fix: 'Add a <main> element or role="main" to identify the main content area.',
      });
    }

    const hasNav = document.querySelector('nav, [role="navigation"]');
    if (!hasNav) {
      foundIssues.push({
        type: 'warning',
        category: 'structure',
        title: 'Missing Navigation Landmark',
        description: 'Page is missing navigation landmarks.',
        wcagLevel: 'AA',
        element: 'nav',
        fix: 'Add <nav> elements or role="navigation" to identify navigation areas.',
      });
    }

    // Check for skip links
    const skipLinks = document.querySelectorAll(
      'a[href="#main"], a[href="#content"], [class*="skip"]'
    );
    if (skipLinks.length === 0) {
      foundIssues.push({
        type: 'warning',
        category: 'keyboard',
        title: 'Missing Skip Links',
        description: 'Page lacks skip navigation links for keyboard users.',
        wcagLevel: 'AA',
        element: 'skip links',
        fix: 'Add skip links at the beginning of the page to allow users to bypass navigation.',
      });
    }

    // Add some positive findings
    if (h1Count === 1) {
      foundIssues.push({
        type: 'success',
        category: 'structure',
        title: 'Proper Page Title Structure',
        description: 'Page has exactly one h1 element.',
        wcagLevel: 'AA',
        element: 'h1',
      });
    }

    if (images.length > 0 && missingAltCount === 0) {
      foundIssues.push({
        type: 'success',
        category: 'content',
        title: 'All Images Have Alt Text',
        description: 'All images on the page have alt attributes.',
        wcagLevel: 'A',
        element: 'img',
      });
    }

    setIssues(foundIssues);
    setIsAuditing(false);
  };

  useEffect(() => {
    // Run initial audit when component mounts
    const timer = setTimeout(() => {
      auditPage();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getIssueIcon = (type: AccessibilityIssue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getCategoryIcon = (category: AccessibilityIssue['category']) => {
    switch (category) {
      case 'structure':
        return <Eye className="h-4 w-4" />;
      case 'contrast':
        return <Contrast className="h-4 w-4" />;
      case 'keyboard':
        return <Keyboard className="h-4 w-4" />;
      case 'aria':
        return <Volume2 className="h-4 w-4" />;
      case 'content':
        return <Eye className="h-4 w-4" />;
    }
  };

  const errorCount = issues.filter((issue) => issue.type === 'error').length;
  const warningCount = issues.filter(
    (issue) => issue.type === 'warning'
  ).length;
  const successCount = issues.filter(
    (issue) => issue.type === 'success'
  ).length;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Accessibility Audit Report
        </CardTitle>
        <CardDescription>
          WCAG 2.1 AA compliance check for this page
        </CardDescription>
        <div className="flex items-center gap-4">
          <Badge variant={errorCount > 0 ? 'destructive' : 'outline'}>
            {errorCount} Errors
          </Badge>
          <Badge variant={warningCount > 0 ? 'secondary' : 'outline'}>
            {warningCount} Warnings
          </Badge>
          <Badge variant={successCount > 0 ? 'default' : 'outline'}>
            {successCount} Passed
          </Badge>
          <Button
            onClick={auditPage}
            disabled={isAuditing}
            size="sm"
            variant="outline"
          >
            {isAuditing ? 'Auditing...' : 'Re-run Audit'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {issues.map((issue, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${
                issue.type === 'error'
                  ? 'border-red-200 bg-red-50'
                  : issue.type === 'warning'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex items-center gap-2">
                  {getIssueIcon(issue.type)}
                  {getCategoryIcon(issue.category)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-medium">{issue.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      WCAG {issue.wcagLevel}
                    </Badge>
                  </div>
                  <p className="mb-2 text-sm text-gray-600">
                    {issue.description}
                  </p>
                  {issue.element && (
                    <p className="mb-2 text-xs text-gray-500">
                      <strong>Element:</strong> {issue.element}
                    </p>
                  )}
                  {issue.fix && (
                    <p className="rounded bg-white/60 p-2 text-xs text-gray-700">
                      <strong>How to fix:</strong> {issue.fix}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {issues.length === 0 && !isAuditing && (
            <div className="py-8 text-center text-gray-500">
              <Eye className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No issues found or audit hasn&apos;t run yet.</p>
              <Button onClick={auditPage} className="mt-2">
                Run Accessibility Audit
              </Button>
            </div>
          )}

          {isAuditing && (
            <div className="py-8 text-center text-gray-500">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              <p>Running accessibility audit...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AccessibilityAudit;

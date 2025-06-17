'use client';

import { AccessibilityAudit } from '@/components/accessibility/accessibility-audit';

export default function AccessibilityTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">
          Accessibility Compliance Test
        </h1>
        <p className="mb-6 text-lg text-gray-600">
          This page demonstrates WCAG 2.1 AA compliance features and provides an
          accessibility audit tool.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Accessibility Audit Component */}
        <div className="lg:col-span-2">
          <AccessibilityAudit />
        </div>

        {/* Examples of Good Accessibility Practices */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Accessible Form Example</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                aria-describedby="email-help"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              <p id="email-help" className="mt-1 text-sm text-gray-600">
                We&apos;ll never share your email with anyone else.
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium"
              >
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                aria-describedby="password-help"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              <p id="password-help" className="mt-1 text-sm text-gray-600">
                Password must be at least 8 characters long.
              </p>
            </div>

            <fieldset className="rounded-md border border-gray-300 p-4">
              <legend className="px-2 text-sm font-medium">
                Notification Preferences
              </legend>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-notifications"
                    name="notifications"
                    value="email"
                    className="mr-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="email-notifications" className="text-sm">
                    Email notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms-notifications"
                    name="notifications"
                    value="sms"
                    className="mr-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="sms-notifications" className="text-sm">
                    SMS notifications
                  </label>
                </div>
              </div>
            </fieldset>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Submit Form
            </button>
          </form>
        </div>

        {/* Color Contrast Examples */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Color Contrast Examples</h2>
          <div className="space-y-4">
            <div className="rounded-md border border-gray-300 bg-white p-4">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Good Contrast (4.5:1+)
              </h3>
              <p className="text-gray-800">
                This text has sufficient contrast for WCAG AA compliance.
              </p>
              <p className="text-blue-600">
                This blue text also meets contrast requirements.
              </p>
            </div>

            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4">
              <h3 className="mb-2 text-lg font-semibold text-yellow-900">
                Warning: Check Contrast
              </h3>
              <p className="text-yellow-800">
                Some yellow/light combinations may need testing.
              </p>
            </div>

            <div className="rounded-md border border-red-300 bg-red-50 p-4">
              <h3 className="mb-2 text-lg font-semibold text-red-900">
                Error: Poor Contrast
              </h3>
              <p className="text-red-600">
                Light grays on white often fail contrast tests.
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard Navigation Examples */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Keyboard Navigation</h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Skip Link</h3>
              <a
                href="#main-content"
                className="sr-only z-50 rounded-md bg-blue-600 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
              >
                Skip to main content
              </a>
              <p className="text-sm text-gray-600">
                Tab to see the skip link appear (try pressing Tab now).
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">Focus Indicators</h3>
              <div className="flex gap-2">
                <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Button 1
                </button>
                <button className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  Button 2
                </button>
                <button className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                  Button 3
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Tab through these buttons to see focus indicators.
              </p>
            </div>
          </div>
        </div>

        {/* ARIA Examples */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">ARIA Features</h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Live Regions</h3>
              <div
                aria-live="polite"
                aria-label="Status updates"
                className="min-h-[3rem] rounded-md border border-blue-300 bg-blue-50 p-3"
              >
                <p>Status updates will appear here...</p>
              </div>
              <button
                className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                onClick={(e) => {
                  const liveRegion =
                    e.currentTarget.previousElementSibling?.querySelector('p');
                  if (liveRegion) {
                    liveRegion.textContent = `Updated at ${new Date().toLocaleTimeString()}`;
                  }
                }}
              >
                Update Status
              </button>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">Progress Indicator</h3>
              <div className="space-y-2">
                <label htmlFor="progress-demo" className="text-sm font-medium">
                  Upload Progress
                </label>
                <div
                  role="progressbar"
                  aria-valuenow={65}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress: 65 percent"
                  className="h-3 w-full rounded-full bg-gray-200"
                >
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all"
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">65% complete</p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">Expandable Content</h3>
              <button
                aria-expanded={false}
                aria-controls="expandable-content"
                className="flex w-full items-center justify-between rounded-md bg-gray-100 p-3 text-left hover:bg-gray-200 focus:ring-2 focus:ring-blue-500"
                onClick={(e) => {
                  const button = e.currentTarget;
                  const content = document.getElementById('expandable-content');
                  const isExpanded =
                    button.getAttribute('aria-expanded') === 'true';

                  button.setAttribute(
                    'aria-expanded',
                    (!isExpanded).toString()
                  );
                  if (content) {
                    content.hidden = isExpanded;
                  }
                }}
              >
                <span>Click to expand details</span>
                <span aria-hidden="true">▼</span>
              </button>
              <div
                id="expandable-content"
                hidden
                className="mt-2 rounded-md bg-gray-50 p-3"
              >
                <p>
                  This content can be expanded and collapsed. Screen readers
                  will announce the state changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content anchor for skip link */}
      <main id="main-content" className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Main Content Area</h2>
        <p className="text-gray-700">
          This is the main content area that users can skip to using the skip
          link above. It demonstrates proper semantic markup and accessibility
          features.
        </p>
      </main>
    </div>
  );
}

/**
 * Focus management utilities for keyboard navigation
 */

// Get all focusable elements within a container
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(',');

  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors)
  );

  return elements.filter((el) => {
    const style = getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      el.offsetWidth > 0 &&
      el.offsetHeight > 0
    );
  });
}

// Announce to screen readers
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.setAttribute('class', 'sr-only');
  announcer.textContent = message;

  document.body.appendChild(announcer);

  setTimeout(() => {
    if (document.body.contains(announcer)) {
      document.body.removeChild(announcer);
    }
  }, 1000);
}

// Store and restore focus
let previouslyFocusedElement: HTMLElement | null = null;

export function storeFocus(): void {
  previouslyFocusedElement = document.activeElement as HTMLElement;
}

export function restoreFocus(): void {
  if (
    previouslyFocusedElement &&
    typeof previouslyFocusedElement.focus === 'function'
  ) {
    previouslyFocusedElement.focus();
    previouslyFocusedElement = null;
  }
}

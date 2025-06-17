/**
 * Focus management utilities for keyboard navigation
 */

import { toast } from 'sonner';

// Get all focusable elements within a container
export function getFocusableElements(
  container: Element = document.body
): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'details summary',
    'audio[controls]',
    'video[controls]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)).filter(
    (element) => {
      const el = element as HTMLElement;
      return el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hidden;
    }
  ) as HTMLElement[];
}

// Announce to screen readers
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const region = ensureLiveRegion();

  // Set the priority level
  region.setAttribute('aria-live', priority);

  // Clear previous message
  region.textContent = '';

  // Set new message after a brief delay to ensure it's announced
  setTimeout(() => {
    region.textContent = message;
    console.log(`🔊 Screen reader announcement (${priority}): ${message}`);
  }, 100);

  // Clear message after 5 seconds to prevent accumulation
  setTimeout(() => {
    if (region.textContent === message) {
      region.textContent = '';
    }
  }, 5000);
}

// Store and restore focus
const focusStack: HTMLElement[] = [];

export function storeFocus(): void {
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement && activeElement !== document.body) {
    focusStack.push(activeElement);
  }
}

export function restoreFocus(): void {
  const element = focusStack.pop();
  if (element && typeof element.focus === 'function') {
    // Use requestAnimationFrame to ensure the element is ready for focus
    requestAnimationFrame(() => {
      try {
        element.focus();
      } catch (error) {
        console.warn('Failed to restore focus:', error);
      }
    });
  }
}

/**
 * Live region for screen reader announcements
 */
let liveRegion: HTMLElement | null = null;

function ensureLiveRegion(): HTMLElement {
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'screen-reader-announcements';
    document.body.appendChild(liveRegion);
  }
  return liveRegion;
}

/**
 * Trap focus within a container (useful for modals)
 */
export function trapFocus(container: Element): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: Event) => {
    const keyboardEvent = e as KeyboardEvent;
    if (keyboardEvent.key !== 'Tab') return;

    if (keyboardEvent.shiftKey && document.activeElement === firstElement) {
      keyboardEvent.preventDefault();
      lastElement?.focus();
    } else if (
      !keyboardEvent.shiftKey &&
      document.activeElement === lastElement
    ) {
      keyboardEvent.preventDefault();
      firstElement?.focus();
    }
  };

  document.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Focus first invalid form field
 */
export function focusFirstInvalidField(form: HTMLFormElement): void {
  const invalidField = form.querySelector(':invalid') as HTMLElement;
  if (invalidField && typeof invalidField.focus === 'function') {
    invalidField.focus();
    announce('Please correct the highlighted field', 'assertive');
  }
}

/**
 * Enhanced keyboard navigation for lists and grids
 */
export interface KeyboardNavigationOptions {
  container: Element;
  itemSelector: string;
  onActivate?: (item: Element) => void;
  allowWrap?: boolean;
  gridColumns?: number; // For grid navigation
}

export function enableKeyboardNavigation(
  options: KeyboardNavigationOptions
): () => void {
  const {
    container,
    itemSelector,
    onActivate,
    allowWrap = true,
    gridColumns,
  } = options;

  let currentIndex = 0;

  const getItems = () => Array.from(container.querySelectorAll(itemSelector));

  const focusItem = (index: number) => {
    const items = getItems();
    if (items[index]) {
      (items[index] as HTMLElement).focus();
      currentIndex = index;
    }
  };

  const handleKeyDown = (e: Event) => {
    const keyboardEvent = e as KeyboardEvent;
    const items = getItems();
    if (items.length === 0) return;

    let newIndex = currentIndex;

    switch (keyboardEvent.key) {
      case 'ArrowDown':
        keyboardEvent.preventDefault();
        if (gridColumns) {
          newIndex = Math.min(currentIndex + gridColumns, items.length - 1);
        } else {
          newIndex = allowWrap
            ? (currentIndex + 1) % items.length
            : Math.min(currentIndex + 1, items.length - 1);
        }
        break;

      case 'ArrowUp':
        keyboardEvent.preventDefault();
        if (gridColumns) {
          newIndex = Math.max(currentIndex - gridColumns, 0);
        } else {
          newIndex = allowWrap
            ? currentIndex === 0
              ? items.length - 1
              : currentIndex - 1
            : Math.max(currentIndex - 1, 0);
        }
        break;

      case 'ArrowRight':
        keyboardEvent.preventDefault();
        if (gridColumns) {
          newIndex = allowWrap
            ? (currentIndex + 1) % items.length
            : Math.min(currentIndex + 1, items.length - 1);
        } else {
          return; // Not applicable for list navigation
        }
        break;

      case 'ArrowLeft':
        keyboardEvent.preventDefault();
        if (gridColumns) {
          newIndex = allowWrap
            ? currentIndex === 0
              ? items.length - 1
              : currentIndex - 1
            : Math.max(currentIndex - 1, 0);
        } else {
          return; // Not applicable for list navigation
        }
        break;

      case 'Home':
        keyboardEvent.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        keyboardEvent.preventDefault();
        newIndex = items.length - 1;
        break;

      case 'Enter':
      case ' ':
        keyboardEvent.preventDefault();
        if (onActivate) {
          onActivate(items[currentIndex]);
        }
        return;

      default:
        return;
    }

    focusItem(newIndex);
  };

  container.addEventListener('keydown', handleKeyDown);

  // Set initial focus if no item is focused
  if (!container.contains(document.activeElement)) {
    focusItem(0);
  }

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Skip link management
 */
export function addSkipLink(target: string, label: string): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${target}`;
  skipLink.textContent = label;
  skipLink.className =
    'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

  // Insert at beginning of body
  document.body.insertBefore(skipLink, document.body.firstChild);

  return skipLink;
}

/**
 * Accessible toast notifications with screen reader support
 */
export function accessibleToast(
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
): void {
  // Show visual toast
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warning(message);
      break;
    default:
      toast(message);
  }

  // Also announce to screen readers
  const priority = type === 'error' ? 'assertive' : 'polite';
  announce(`${type === 'error' ? 'Error: ' : ''}${message}`, priority);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Manage ARIA expanded state for collapsible elements
 */
export function toggleExpanded(
  trigger: HTMLElement,
  content: HTMLElement
): void {
  const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
  const newState = !isExpanded;

  trigger.setAttribute('aria-expanded', newState.toString());
  content.setAttribute('aria-hidden', (!newState).toString());

  if (newState) {
    content.style.display = 'block';
  } else {
    content.style.display = 'none';
  }

  announce(`Content ${newState ? 'expanded' : 'collapsed'}`);
}

/**
 * Batch announce multiple status updates
 */
export function batchAnnounce(messages: string[], delay: number = 1000): void {
  messages.forEach((message, index) => {
    setTimeout(() => {
      announce(message);
    }, index * delay);
  });
}

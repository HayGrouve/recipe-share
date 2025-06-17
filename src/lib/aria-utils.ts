/**
 * ARIA utility functions for enhanced screen reader support
 * Recipe Share Application - Accessibility Enhancements
 */

/**
 * Set multiple ARIA attributes on an element
 */
export function setAriaAttributes(
  element: HTMLElement,
  attributes: Record<string, string | boolean | number>
): void {
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(`aria-${key}`, String(value));
    }
  });
}

/**
 * Enhanced form field accessibility
 */
export function enhanceFormField(
  field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  options: {
    label?: string;
    description?: string;
    required?: boolean;
    invalid?: boolean;
    errorMessage?: string;
  }
): void {
  const { description, required, invalid, errorMessage } = options;

  // Set required attribute
  if (required) {
    field.setAttribute('required', 'true');
    field.setAttribute('aria-required', 'true');
  }

  // Set invalid state
  if (invalid) {
    field.setAttribute('aria-invalid', 'true');
    if (errorMessage) {
      const errorId = `${field.id || 'field'}-error`;
      field.setAttribute('aria-describedby', errorId);

      // Create or update error message element
      let errorElement = document.getElementById(errorId);
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'sr-only';
        errorElement.setAttribute('role', 'alert');
        field.parentNode?.appendChild(errorElement);
      }
      errorElement.textContent = errorMessage;
    }
  } else {
    field.setAttribute('aria-invalid', 'false');
  }

  // Set description
  if (description) {
    const descId = `${field.id || 'field'}-description`;
    field.setAttribute('aria-describedby', descId);

    let descElement = document.getElementById(descId);
    if (!descElement) {
      descElement = document.createElement('div');
      descElement.id = descId;
      descElement.className = 'text-sm text-gray-600 mt-1';
      field.parentNode?.appendChild(descElement);
    }
    descElement.textContent = description;
  }
}

/**
 * Create accessible status indicator
 */
export function createStatusIndicator(
  status: 'success' | 'error' | 'warning' | 'info',
  message: string,
  container?: HTMLElement
): HTMLElement {
  const indicator = document.createElement('div');
  indicator.setAttribute('role', 'status');
  indicator.setAttribute(
    'aria-live',
    status === 'error' ? 'assertive' : 'polite'
  );
  indicator.className = `status-indicator status-${status} sr-only`;
  indicator.textContent = message;

  if (container) {
    container.appendChild(indicator);
  }

  return indicator;
}

/**
 * Enhanced button accessibility
 */
export function enhanceButton(
  button: HTMLButtonElement,
  options: {
    pressed?: boolean;
    expanded?: boolean;
    controls?: string;
    describedBy?: string;
    label?: string;
  }
): void {
  const { pressed, expanded, controls, describedBy, label } = options;

  if (pressed !== undefined) {
    button.setAttribute('aria-pressed', String(pressed));
  }

  if (expanded !== undefined) {
    button.setAttribute('aria-expanded', String(expanded));
  }

  if (controls) {
    button.setAttribute('aria-controls', controls);
  }

  if (describedBy) {
    button.setAttribute('aria-describedby', describedBy);
  }

  if (label) {
    button.setAttribute('aria-label', label);
  }
}

/**
 * Create accessible loading state
 */
export function createLoadingState(
  container: HTMLElement,
  message: string = 'Loading...'
): HTMLElement {
  const loadingElement = document.createElement('div');
  loadingElement.setAttribute('role', 'status');
  loadingElement.setAttribute('aria-live', 'polite');
  loadingElement.className = 'loading-state';

  const spinner = document.createElement('div');
  spinner.className =
    'animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full';
  spinner.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.textContent = message;
  label.className = 'sr-only';

  loadingElement.appendChild(spinner);
  loadingElement.appendChild(label);
  container.appendChild(loadingElement);

  return loadingElement;
}

/**
 * Enhanced table accessibility
 */
export function enhanceTable(table: HTMLTableElement): void {
  // Add table role and caption if missing
  if (!table.getAttribute('role')) {
    table.setAttribute('role', 'table');
  }

  // Enhance headers
  const headers = table.querySelectorAll('th');
  headers.forEach((header, index) => {
    if (!header.getAttribute('scope')) {
      header.setAttribute('scope', 'col');
    }
    if (!header.id) {
      header.id = `header-${index}`;
    }
  });

  // Enhance data cells
  const cells = table.querySelectorAll('td');
  cells.forEach((cell) => {
    const row = cell.parentElement as HTMLTableRowElement;
    const cellIndex = Array.from(row.cells).indexOf(
      cell as HTMLTableCellElement
    );
    const header = headers[cellIndex];

    if (header && !cell.getAttribute('headers')) {
      cell.setAttribute('headers', header.id);
    }
  });
}

/**
 * Create accessible breadcrumb navigation
 */
export function createBreadcrumbs(
  items: Array<{ label: string; href?: string; current?: boolean }>,
  container: HTMLElement
): void {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.className = 'breadcrumb-list flex items-center space-x-2';

  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'breadcrumb-item';

    if (item.current) {
      li.setAttribute('aria-current', 'page');
      const span = document.createElement('span');
      span.textContent = item.label;
      span.className = 'font-medium text-gray-900';
      li.appendChild(span);
    } else if (item.href) {
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.label;
      link.className = 'text-blue-600 hover:text-blue-800';
      li.appendChild(link);
    } else {
      const span = document.createElement('span');
      span.textContent = item.label;
      span.className = 'text-gray-500';
      li.appendChild(span);
    }

    ol.appendChild(li);

    // Add separator (except for last item)
    if (index < items.length - 1) {
      const separator = document.createElement('span');
      separator.textContent = '/';
      separator.className = 'text-gray-400';
      separator.setAttribute('aria-hidden', 'true');
      ol.appendChild(separator);
    }
  });

  nav.appendChild(ol);
  container.appendChild(nav);
}

/**
 * Enhanced list accessibility with proper ARIA
 */
export function enhanceList(
  list: HTMLUListElement | HTMLOListElement,
  options: {
    label?: string;
    describedBy?: string;
    multiselectable?: boolean;
  } = {}
): void {
  const { label, describedBy, multiselectable } = options;

  list.setAttribute('role', 'list');

  if (label) {
    list.setAttribute('aria-label', label);
  }

  if (describedBy) {
    list.setAttribute('aria-describedby', describedBy);
  }

  if (multiselectable) {
    list.setAttribute('aria-multiselectable', 'true');
  }

  // Enhance list items
  const items = list.querySelectorAll('li');
  items.forEach((item, index) => {
    item.setAttribute('role', 'listitem');
    if (!item.id) {
      item.id = `list-item-${index}`;
    }
  });
}

/**
 * Create accessible modal dialog
 */
export function enhanceModal(
  modal: HTMLElement,
  options: {
    title?: string;
    labelledBy?: string;
    describedBy?: string;
  }
): void {
  const { title, labelledBy, describedBy } = options;

  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  if (title && !labelledBy) {
    const titleId = 'modal-title';
    modal.setAttribute('aria-labelledby', titleId);

    // Find or create title element
    let titleElement = modal.querySelector(`#${titleId}`);
    if (!titleElement) {
      titleElement = modal.querySelector('h1, h2, h3, h4, h5, h6');
      if (titleElement) {
        titleElement.id = titleId;
      }
    }
  } else if (labelledBy) {
    modal.setAttribute('aria-labelledby', labelledBy);
  }

  if (describedBy) {
    modal.setAttribute('aria-describedby', describedBy);
  }

  // Ensure modal is focusable
  if (!modal.hasAttribute('tabindex')) {
    modal.setAttribute('tabindex', '-1');
  }
}

/**
 * Progressive enhancement for existing components
 */
export function progressivelyEnhance(): void {
  // Enhance all forms
  document.querySelectorAll('form').forEach((form) => {
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach((field) => {
      const htmlField = field as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement;

      // Add basic ARIA support
      if (
        htmlField.hasAttribute('required') &&
        !htmlField.hasAttribute('aria-required')
      ) {
        htmlField.setAttribute('aria-required', 'true');
      }

      // Add invalid state support
      if (!htmlField.hasAttribute('aria-invalid')) {
        htmlField.setAttribute('aria-invalid', 'false');
      }
    });
  });

  // Enhance all tables
  document.querySelectorAll('table').forEach(enhanceTable);

  // Enhance all buttons with state
  document
    .querySelectorAll('button[aria-pressed], button[aria-expanded]')
    .forEach((button) => {
      const htmlButton = button as HTMLButtonElement;
      // Add keyboard support for toggle buttons
      htmlButton.addEventListener('click', () => {
        const pressed = htmlButton.getAttribute('aria-pressed');
        if (pressed !== null) {
          htmlButton.setAttribute(
            'aria-pressed',
            pressed === 'true' ? 'false' : 'true'
          );
        }

        const expanded = htmlButton.getAttribute('aria-expanded');
        if (expanded !== null) {
          htmlButton.setAttribute(
            'aria-expanded',
            expanded === 'true' ? 'false' : 'true'
          );
        }
      });
    });
}

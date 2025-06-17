import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { AlertCircle, Info } from 'lucide-react';

export interface FormFieldProps {
  id: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  layout?: 'vertical' | 'horizontal';
  showOptional?: boolean;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      id,
      label,
      description,
      error,
      required = false,
      disabled = false,
      className,
      children,
      layout = 'vertical',
      showOptional = true,
      ...props
    },
    ref
  ) => {
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const ariaDescribedBy =
      [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div
        ref={ref}
        className={cn(
          'space-y-2',
          layout === 'horizontal' &&
            'sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:space-y-0',
          disabled && 'opacity-60',
          className
        )}
        {...props}
      >
        {/* Label */}
        {label && (
          <div className={cn(layout === 'horizontal' && 'sm:pt-2')}>
            <Label
              htmlFor={id}
              className={cn(
                'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                required &&
                  'after:text-destructive after:ml-0.5 after:content-["*"]',
                error && 'text-destructive'
              )}
            >
              {label}
              {!required && showOptional && (
                <span className="text-muted-foreground ml-1 text-xs font-normal">
                  (optional)
                </span>
              )}
            </Label>
          </div>
        )}

        {/* Input container */}
        <div
          className={cn(
            'space-y-2',
            layout === 'horizontal' && 'sm:col-span-2'
          )}
        >
          {/* Description */}
          {description && (
            <div
              id={descriptionId}
              className="text-muted-foreground flex items-start gap-2 text-sm"
            >
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="leading-5">{description}</p>
            </div>
          )}

          {/* Input field */}
          <div className="relative">
            {React.cloneElement(children as React.ReactElement, {
              id,
              'aria-describedby': ariaDescribedBy,
              'aria-invalid': error ? 'true' : 'false',
              'aria-required': required,
              disabled,
              error: !!error,
            })}
          </div>

          {/* Error message */}
          {error && (
            <div
              id={errorId}
              className="text-destructive flex items-start gap-2 text-sm"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="leading-5">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);
FormField.displayName = 'FormField';

// Fieldset component for grouping related form fields
export interface FieldsetProps
  extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string;
  description?: string;
  error?: string;
  required?: boolean;
  variant?: 'default' | 'bordered' | 'highlighted';
}

const Fieldset = React.forwardRef<HTMLFieldSetElement, FieldsetProps>(
  (
    {
      legend,
      description,
      error,
      required = false,
      variant = 'default',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <fieldset
        ref={ref}
        className={cn(
          'space-y-4',
          variant === 'bordered' && 'border-border rounded-lg border p-4',
          variant === 'highlighted' &&
            'bg-muted/50 border-border rounded-lg border p-4',
          error && 'border-destructive',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {legend && (
          <legend
            className={cn(
              'text-base leading-none font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              variant !== 'default' && '-ml-1 px-1',
              required &&
                'after:text-destructive after:ml-0.5 after:content-["*"]',
              error && 'text-destructive'
            )}
          >
            {legend}
          </legend>
        )}

        {description && (
          <div className="text-muted-foreground flex items-start gap-2 text-sm">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="leading-5">{description}</p>
          </div>
        )}

        {error && (
          <div
            className="text-destructive flex items-start gap-2 text-sm"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="leading-5">{error}</p>
          </div>
        )}

        <div className="space-y-4">{children}</div>
      </fieldset>
    );
  }
);
Fieldset.displayName = 'Fieldset';

// Form section component for organizing forms
export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  (
    {
      title,
      description,
      children,
      className,
      collapsible = false,
      defaultOpen = true,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {title && (
          <div className="space-y-1">
            {collapsible ? (
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="hover:text-primary flex items-center gap-2 text-lg leading-none font-semibold transition-colors"
                aria-expanded={isOpen}
                aria-controls={`form-section-${title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <span>{title}</span>
                <div
                  className={cn(
                    'transform transition-transform',
                    isOpen ? 'rotate-90' : 'rotate-0'
                  )}
                >
                  ▶
                </div>
              </button>
            ) : (
              <h3 className="text-lg leading-none font-semibold">{title}</h3>
            )}

            {description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        {(!collapsible || isOpen) && (
          <div
            id={
              collapsible
                ? `form-section-${title?.replace(/\s+/g, '-').toLowerCase()}`
                : undefined
            }
            className="space-y-4"
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);
FormSection.displayName = 'FormSection';

// Form actions component for submit/cancel buttons
export interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  variant?: 'default' | 'bordered';
}

const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  (
    {
      children,
      className,
      align = 'right',
      sticky = false,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-3 pt-4',
          align === 'left' && 'justify-start',
          align === 'center' && 'justify-center',
          align === 'right' && 'justify-end',
          sticky &&
            'bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border sticky bottom-0 -mx-4 border-t p-4 backdrop-blur',
          variant === 'bordered' && 'border-border border-t',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FormActions.displayName = 'FormActions';

// Enhanced form wrapper with better responsive behavior
export interface ResponsiveFormProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  spacing?: 'compact' | 'normal' | 'relaxed';
}

const ResponsiveForm = React.forwardRef<HTMLFormElement, ResponsiveFormProps>(
  (
    { children, className, maxWidth = 'lg', spacing = 'normal', ...props },
    ref
  ) => {
    return (
      <form
        ref={ref}
        className={cn(
          'mx-auto w-full',
          maxWidth === 'sm' && 'max-w-sm',
          maxWidth === 'md' && 'max-w-md',
          maxWidth === 'lg' && 'max-w-lg',
          maxWidth === 'xl' && 'max-w-xl',
          maxWidth === '2xl' && 'max-w-2xl',
          maxWidth === 'full' && 'max-w-full',
          spacing === 'compact' && 'space-y-3',
          spacing === 'normal' && 'space-y-4',
          spacing === 'relaxed' && 'space-y-6',
          className
        )}
        {...props}
      >
        {children}
      </form>
    );
  }
);
ResponsiveForm.displayName = 'ResponsiveForm';

export { FormField, Fieldset, FormSection, FormActions, ResponsiveForm };

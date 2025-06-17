import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      maxLength,
      showCharCount = false,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // Handle character counting
    React.useEffect(() => {
      if (showCharCount || maxLength) {
        const currentValue = String(props.value || '');
        setCharCount(currentValue.length);
      }
    }, [props.value, showCharCount, maxLength]);

    // Auto-resize functionality
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;

      // Reset height to calculate new height
      textarea.style.height = 'auto';

      const lineHeight =
        parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;

      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [autoResize, minRows, maxRows]);

    React.useEffect(() => {
      adjustHeight();
    }, [props.value, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // Enforce max length if specified
      if (maxLength && newValue.length > maxLength) {
        return;
      }

      if (showCharCount || maxLength) {
        setCharCount(newValue.length);
      }

      props.onChange?.(e);

      // Trigger auto-resize
      if (autoResize) {
        setTimeout(adjustHeight, 0);
      }
    };

    const mergedRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const isNearLimit = maxLength && charCount > maxLength * 0.8;
    const isOverLimit = maxLength && charCount > maxLength;

    return (
      <div className="relative">
        <textarea
          className={cn(
            // Base styles
            'bg-background flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm transition-colors',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none', // We handle resizing manually if autoResize is enabled

            // Focus styles
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',

            // Touch-friendly sizing for mobile
            'touch:min-h-20 touch:text-base touch:py-3',

            // Border and validation states
            error || isOverLimit
              ? 'border-destructive ring-destructive/20 focus-visible:ring-destructive'
              : 'border-input focus-visible:border-ring',

            // Selection styling
            'selection:bg-primary selection:text-primary-foreground',

            className
          )}
          ref={mergedRef}
          onChange={handleChange}
          aria-invalid={error || isOverLimit ? 'true' : 'false'}
          aria-describedby={
            showCharCount || maxLength ? `${props.id}-char-count` : undefined
          }
          rows={autoResize ? minRows : props.rows}
          style={{
            minHeight: autoResize ? `${minRows * 1.5}rem` : undefined,
            maxHeight: autoResize ? `${maxRows * 1.5}rem` : undefined,
            overflowY: autoResize ? 'hidden' : 'auto',
          }}
          {...props}
        />

        {/* Character count display */}
        {(showCharCount || maxLength) && (
          <div
            id={`${props.id}-char-count`}
            className={cn(
              'absolute right-3 bottom-2 text-xs',
              'bg-background/80 rounded px-1 backdrop-blur-sm',
              isOverLimit
                ? 'text-destructive font-medium'
                : isNearLimit
                  ? 'text-orange-600'
                  : 'text-muted-foreground'
            )}
            aria-live="polite"
          >
            {maxLength ? `${charCount}/${maxLength}` : charCount}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// Auto-expanding textarea with better UX
export interface AutoTextareaProps
  extends Omit<TextareaProps, 'autoResize' | 'rows'> {
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
}

const AutoTextarea = React.forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  ({ minRows = 3, maxRows = 10, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        autoResize
        minRows={minRows}
        maxRows={maxRows}
        showCharCount={props.maxLength !== undefined}
        {...props}
      />
    );
  }
);
AutoTextarea.displayName = 'AutoTextarea';

// Rich text area with formatting hints
export interface RichTextareaProps extends TextareaProps {
  hints?: string[];
  showHints?: boolean;
}

const RichTextarea = React.forwardRef<HTMLTextAreaElement, RichTextareaProps>(
  ({ hints = [], showHints = true, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Textarea ref={ref} {...props} />

        {showHints && hints.length > 0 && (
          <div className="text-muted-foreground space-y-1 text-xs">
            <p className="font-medium">Formatting tips:</p>
            <ul className="list-inside list-disc space-y-0.5">
              {hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);
RichTextarea.displayName = 'RichTextarea';

export { Textarea, AutoTextarea, RichTextarea };

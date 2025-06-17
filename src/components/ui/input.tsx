import * as React from 'react';
import { Eye, EyeOff, Loader2, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      loading,
      clearable,
      onClear,
      startIcon,
      endIcon,
      error,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const isPassword = type === 'password';
    const actualType = isPassword && showPassword ? 'text' : type;

    const hasValue = props.value && String(props.value).length > 0;
    const showClearButton =
      clearable && hasValue && !props.disabled && !loading;

    return (
      <div className="relative">
        {/* Start Icon */}
        {startIcon && (
          <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            {startIcon}
          </div>
        )}

        <input
          type={actualType}
          className={cn(
            // Base styles
            'bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',

            // Focus styles
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',

            // Touch-friendly sizing for mobile
            'touch:min-h-12 touch:text-base',

            // Border and validation states
            error
              ? 'border-destructive ring-destructive/20 focus-visible:ring-destructive'
              : 'border-input focus-visible:border-ring',

            // Selection styling
            'selection:bg-primary selection:text-primary-foreground',

            // Padding adjustments for icons
            startIcon && 'pl-10',
            (endIcon || showClearButton || isPassword || loading) && 'pr-10',

            className
          )}
          ref={ref}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          aria-invalid={error}
          {...props}
        />

        {/* End Icons Container */}
        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
          {/* Loading Spinner */}
          {loading && (
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          )}

          {/* Clear Button */}
          {showClearButton && !loading && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onClear?.();
              }}
              className="hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm p-0.5 transition-colors focus-visible:ring-1 focus-visible:outline-none"
              aria-label="Clear input"
              tabIndex={-1}
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {/* Password Toggle */}
          {isPassword && !loading && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm p-0.5 transition-colors focus-visible:ring-1 focus-visible:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Custom End Icon */}
          {endIcon && !loading && !showClearButton && !isPassword && (
            <div className="text-muted-foreground pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = 'Input';

// Search Input Component
export interface SearchInputProps
  extends Omit<InputProps, 'type' | 'startIcon'> {
  onSearch?: (value: string) => void;
  searchDelay?: number;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, searchDelay = 300, ...props }, ref) => {
    const [searchValue, setSearchValue] = React.useState(
      String(props.value || '')
    );
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (onSearch) {
        timeoutRef.current = setTimeout(() => {
          onSearch(String(searchValue));
        }, searchDelay);
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [searchValue, onSearch, searchDelay]);

    return (
      <Input
        ref={ref}
        type="search"
        startIcon={<Search className="h-4 w-4" />}
        clearable
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
          props.onChange?.(e);
        }}
        onClear={() => {
          setSearchValue('');
          if (onSearch) {
            onSearch('');
          }
        }}
        {...props}
      />
    );
  }
);
SearchInput.displayName = 'SearchInput';

// Numeric Input Component
export interface NumericInputProps
  extends Omit<InputProps, 'type' | 'onChange'> {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  allowNegative?: boolean;
  onChange?: (value: number | undefined) => void;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      min,
      max,
      step = 1,
      precision = 0,
      allowNegative = true,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState(
      value !== undefined ? String(value) : ''
    );

    const formatNumber = React.useCallback(
      (num: number): string => {
        return precision > 0 ? num.toFixed(precision) : String(Math.round(num));
      },
      [precision]
    );

    const parseNumber = (str: string): number | undefined => {
      if (!str.trim()) return undefined;
      const num = Number(str);
      return isNaN(num) ? undefined : num;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Allow empty string, numbers, and decimal points
      if (newValue === '' || /^-?\d*\.?\d*$/.test(newValue)) {
        // Check for negative values
        if (!allowNegative && newValue.startsWith('-')) {
          return;
        }

        setDisplayValue(newValue);

        const parsedValue = parseNumber(newValue);
        if (parsedValue !== undefined) {
          // Apply min/max constraints
          let constrainedValue = parsedValue;
          if (min !== undefined)
            constrainedValue = Math.max(min, constrainedValue);
          if (max !== undefined)
            constrainedValue = Math.min(max, constrainedValue);

          onChange?.(constrainedValue);
        } else {
          onChange?.(undefined);
        }
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const parsedValue = parseNumber(displayValue);
      if (parsedValue !== undefined) {
        let constrainedValue = parsedValue;
        if (min !== undefined)
          constrainedValue = Math.max(min, constrainedValue);
        if (max !== undefined)
          constrainedValue = Math.min(max, constrainedValue);

        const formattedValue = formatNumber(constrainedValue);
        setDisplayValue(formattedValue);
        onChange?.(constrainedValue);
      }

      props.onBlur?.(e);
    };

    React.useEffect(() => {
      if (value !== undefined) {
        const numValue = typeof value === 'number' ? value : Number(value);
        if (!isNaN(numValue)) {
          setDisplayValue(formatNumber(numValue));
        }
      }
    }, [value, formatNumber]);

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    );
  }
);
NumericInput.displayName = 'NumericInput';

export { Input, SearchInput, NumericInput };

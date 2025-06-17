import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    error?: boolean;
    clearable?: boolean;
    onClear?: () => void;
  }
>(({ className, children, error, clearable, onClear, ...props }, ref) => {
  const hasValue = props.value || (typeof children === 'string' && children);

  return (
    <div className="relative">
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          // Base styles
          'bg-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors',
          'placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&>span]:line-clamp-1',

          // Focus styles
          'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',

          // Touch-friendly sizing for mobile
          'touch:min-h-12 touch:text-base',

          // Border and validation states
          error
            ? 'border-destructive ring-destructive/20 focus:ring-destructive'
            : 'border-input focus:border-ring',

          // Padding adjustment for clear button
          clearable && hasValue && 'pr-12',

          className
        )}
        aria-invalid={error}
        {...props}
      >
        {children}
        <div className="flex items-center gap-1">
          {/* Clear Button */}
          {clearable && hasValue && onClear && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClear();
              }}
              className="hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm p-0.5 transition-colors focus-visible:ring-1 focus-visible:outline-none"
              aria-label="Clear selection"
              tabIndex={-1}
            >
              <X className="h-3 w-3" />
            </button>
          )}

          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </div>
      </SelectPrimitive.Trigger>
    </div>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    searchable?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
  }
>(
  (
    {
      className,
      children,
      position = 'popper',
      searchable,
      searchPlaceholder,
      emptyMessage,
      ...props
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filteredChildren, setFilteredChildren] = React.useState<
      React.ReactNode[]
    >([]);

    // Handle search functionality
    React.useEffect(() => {
      if (!searchable) {
        setFilteredChildren(React.Children.toArray(children));
        return;
      }

      const filtered = React.Children.toArray(children).filter((child) => {
        if (!React.isValidElement(child)) return true;

        // Simple text-based search - avoid complex type checking
        const query = searchQuery.toLowerCase();
        if (React.isValidElement(child)) {
          const childProps = child.props as Record<string, unknown>;
          const value =
            typeof childProps.value === 'string'
              ? childProps.value.toLowerCase()
              : '';
          const textContent =
            typeof childProps.children === 'string'
              ? childProps.children.toLowerCase()
              : '';
          return value.includes(query) || textContent.includes(query);
        }

        return true;
      });

      setFilteredChildren(filtered);
    }, [children, searchQuery, searchable]);

    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            'bg-popover text-popover-foreground relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            position === 'popper' &&
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className
          )}
          position={position}
          {...props}
        >
          {/* Search input */}
          {searchable && (
            <div className="border-border border-b p-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={searchPlaceholder || 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background border-input focus:ring-ring w-full rounded-md border py-1.5 pr-3 pl-8 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none"
                  aria-label="Search options"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:bg-muted text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          <SelectScrollUpButton />

          <SelectPrimitive.Viewport
            className={cn(
              'p-1',
              position === 'popper' &&
                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
            )}
          >
            {/* Empty state */}
            {searchable && filteredChildren.length === 0 && searchQuery && (
              <div className="text-muted-foreground py-6 text-center text-sm">
                {emptyMessage || 'No results found.'}
              </div>
            )}

            {/* Regular children or filtered children */}
            {searchable ? filteredChildren : children}
          </SelectPrimitive.Viewport>

          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  }
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pr-2 pl-8 text-sm font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('bg-muted -mx-1 my-1 h-px', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// Multi-select component
interface MultiSelectProps {
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  maxItems?: number;
  searchable?: boolean;
  emptyMessage?: string;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onValueChange,
      placeholder = 'Select items...',
      disabled,
      error,
      className,
      maxItems,
      searchable = true,
      emptyMessage = 'No options available',
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      return options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          option.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [options, searchQuery]);

    const selectedItems = options.filter((option) =>
      value.includes(option.value)
    );
    const availableOptions = filteredOptions.filter(
      (option) => !value.includes(option.value)
    );

    const handleSelect = (optionValue: string) => {
      if (maxItems && value.length >= maxItems) return;

      const newValue = [...value, optionValue];
      onValueChange?.(newValue);
    };

    const handleRemove = (optionValue: string) => {
      const newValue = value.filter((v) => v !== optionValue);
      onValueChange?.(newValue);
    };

    return (
      <div className="relative">
        <button
          ref={ref}
          type="button"
          onClick={() => setOpen(!open)}
          disabled={disabled}
          className={cn(
            'bg-background flex min-h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
            'touch:min-h-12 touch:text-base',
            error
              ? 'border-destructive ring-destructive/20 focus:ring-destructive'
              : 'border-input focus:border-ring',
            className
          )}
          data-invalid={error}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <div className="flex flex-1 flex-wrap gap-1">
            {selectedItems.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedItems.map((item) => (
                <span
                  key={item.value}
                  className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs"
                >
                  {item.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(item.value);
                    }}
                    className="hover:bg-secondary-foreground/20 ml-1 rounded-full p-0.5"
                    aria-label={`Remove ${item.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {open && (
          <div className="bg-popover absolute z-50 mt-1 w-full rounded-md border shadow-md">
            {searchable && (
              <div className="border-border border-b p-2">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background border-input focus:ring-ring w-full rounded-md border py-1.5 pr-3 pl-8 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-auto p-1">
              {availableOptions.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  {emptyMessage}
                </div>
              ) : (
                availableOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    disabled={
                      option.disabled ||
                      (maxItems !== undefined && value.length >= maxItems)
                    }
                    className="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-sm disabled:pointer-events-none disabled:opacity-50"
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
MultiSelect.displayName = 'MultiSelect';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  MultiSelect,
};

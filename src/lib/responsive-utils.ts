// Responsive utilities for kitchen-friendly design

// Typography scale for different screen sizes and modes
export const typographyScale = {
  // Base sizes (mobile-first)
  mobile: {
    xs: 'text-xs', // 12px
    sm: 'text-sm', // 14px
    base: 'text-base', // 16px
    lg: 'text-lg', // 18px
    xl: 'text-xl', // 20px
    '2xl': 'text-2xl', // 24px
    '3xl': 'text-3xl', // 30px
    '4xl': 'text-4xl', // 36px
  },

  // Kitchen mode sizes (larger for easier reading)
  kitchen: {
    xs: 'text-sm', // 14px
    sm: 'text-base', // 16px
    base: 'text-lg', // 18px
    lg: 'text-xl', // 20px
    xl: 'text-2xl', // 24px
    '2xl': 'text-3xl', // 30px
    '3xl': 'text-4xl', // 36px
    '4xl': 'text-5xl', // 48px
  },
};

// Responsive text size class generator
export function responsiveText(
  size: keyof typeof typographyScale.mobile,
  mode: 'normal' | 'kitchen' = 'normal'
) {
  const baseSize = typographyScale.mobile[size];
  const kitchenSize = typographyScale.kitchen[size];

  if (mode === 'kitchen') {
    return `${baseSize} kitchen-mode:${kitchenSize}`;
  }

  return baseSize;
}

// Touch target utilities for kitchen mode
export const touchTargets = {
  minimum: 'min-h-[44px] min-w-[44px]', // WCAG AA minimum
  comfortable: 'min-h-12 min-w-12', // 48px - better for kitchen
  large: 'min-h-16 min-w-16', // 64px - very kitchen-friendly
};

export function kitchenFriendlyButton(
  size: 'minimum' | 'comfortable' | 'large' = 'comfortable'
) {
  return `${touchTargets[size]} kitchen-mode:${touchTargets.large} kitchen-mode:text-lg kitchen-mode:px-6 kitchen-mode:py-3`;
}

// Spacing utilities for kitchen mode
export const kitchenSpacing = {
  section: 'mb-4 kitchen-mode:mb-8',
  paragraph: 'mb-2 kitchen-mode:mb-4',
  list: 'space-y-1 kitchen-mode:space-y-3',
  button: 'gap-2 kitchen-mode:gap-4',
  form: 'space-y-3 kitchen-mode:space-y-6',
};

// Image utilities for responsive display and kitchen viewing
export function responsiveImage() {
  const baseClasses = 'w-full h-auto object-cover rounded-lg';
  const kitchenClasses = 'kitchen-mode:max-h-64 kitchen-mode:object-contain';
  const printClasses =
    'print:max-w-[4in] print:max-h-[3in] print:break-inside-avoid';

  return `${baseClasses} ${kitchenClasses} ${printClasses}`;
}

// Layout utilities for different viewing contexts
export const layoutUtils = {
  // Container widths
  container: 'max-w-4xl mx-auto px-4 kitchen-mode:px-6',

  // Recipe-specific layouts
  recipeHeader: 'mb-6 kitchen-mode:mb-10 print:mb-4',
  recipeSection: 'mb-8 kitchen-mode:mb-12 print:mb-6 print:break-inside-avoid',
  recipeStep:
    'mb-4 kitchen-mode:mb-6 kitchen-mode:p-6 kitchen-mode:border-2 kitchen-mode:rounded-lg print:mb-2 print:break-inside-avoid',

  // Grid layouts that work well in kitchen mode
  ingredientGrid:
    'grid grid-cols-1 sm:grid-cols-2 gap-3 kitchen-mode:grid-cols-1 kitchen-mode:gap-4',
  recipeCardGrid:
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 kitchen-mode:grid-cols-1 kitchen-mode:gap-6',

  // Print-friendly layouts
  printHidden: 'print:hidden',
  printOnly: 'hidden print:block',
  printPageBreak: 'print:break-before-page',
};

// Kitchen-specific color utilities
export const kitchenColors = {
  // High contrast text for kitchen visibility
  text: 'text-gray-900 kitchen-mode:text-black',
  textMuted: 'text-gray-600 kitchen-mode:text-gray-800',

  // Kitchen-friendly backgrounds
  background: 'bg-white kitchen-mode:bg-gray-50',
  cardBackground: 'bg-gray-50 kitchen-mode:bg-white kitchen-mode:border-2',

  // Emphasis colors for kitchen mode
  accent:
    'text-primary kitchen-mode:text-black kitchen-mode:bg-yellow-100 kitchen-mode:px-2 kitchen-mode:py-1 kitchen-mode:rounded',
  warning: 'text-orange-600 kitchen-mode:text-red-700 kitchen-mode:font-bold',
  success: 'text-green-600 kitchen-mode:text-green-800 kitchen-mode:font-bold',
};

// Accessibility utilities
export const a11yUtils = {
  // Focus management
  focusRing:
    'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 kitchen-mode:focus-visible:ring-4',

  // Screen reader utilities
  srOnly: 'sr-only',
  srOnlyFocusable:
    'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:p-2 focus:rounded',

  // High contrast utilities
  highContrast: 'contrast-more:border-black contrast-more:text-black',

  // Motion preferences
  reducedMotion: 'motion-reduce:transition-none motion-reduce:animate-none',
};

// Utility function to combine kitchen mode classes
export function withKitchenMode(baseClasses: string, kitchenClasses: string) {
  return `${baseClasses} kitchen-mode:${kitchenClasses}`;
}

// Pre-defined component class combinations
export const componentClasses = {
  // Recipe title styling
  recipeTitle: `${responsiveText('3xl')} font-bold ${kitchenColors.text} ${kitchenSpacing.section}`,

  // Recipe section headers
  sectionHeader: `${responsiveText('xl')} font-semibold ${kitchenColors.text} ${kitchenSpacing.paragraph}`,

  // Recipe steps
  recipeStep: `${responsiveText('base')} ${kitchenColors.text} ${layoutUtils.recipeStep}`,

  // Ingredient list items
  ingredient: `${responsiveText('base')} ${kitchenColors.text} kitchen-mode:mb-3 kitchen-mode:p-3 kitchen-mode:bg-gray-50 kitchen-mode:rounded`,

  // Timer displays
  timer: `${responsiveText('2xl')} font-bold ${kitchenColors.accent} kitchen-mode:text-3xl kitchen-mode:bg-yellow-200 kitchen-mode:px-4 kitchen-mode:py-2 kitchen-mode:rounded-lg`,

  // Quantity displays
  quantity: `${responsiveText('lg')} font-semibold ${kitchenColors.accent} kitchen-mode:text-xl kitchen-mode:bg-blue-100 kitchen-mode:px-2 kitchen-mode:py-1 kitchen-mode:rounded`,

  // Navigation buttons
  navButton: `${kitchenFriendlyButton()} ${a11yUtils.focusRing} ${a11yUtils.reducedMotion}`,

  // Form inputs in kitchen mode
  formInput: `w-full ${touchTargets.comfortable} kitchen-mode:${touchTargets.large} kitchen-mode:text-lg ${a11yUtils.focusRing}`,
};

// Export commonly used combinations
export const kitchenModeClasses = {
  ...componentClasses,
  ...layoutUtils,
  ...kitchenColors,
  ...a11yUtils,
  spacing: kitchenSpacing,
  touchTargets,
};

export default kitchenModeClasses;

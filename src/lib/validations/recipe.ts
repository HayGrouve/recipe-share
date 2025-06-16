import { z } from 'zod';

// Helper schemas for common patterns
const positiveNumber = z.number().min(0, 'Must be a positive number');
const nonEmptyString = z.string().min(1, 'This field is required');

// Ingredient schema
export const ingredientSchema = z.object({
  id: z.string(),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.string().min(1, 'Unit is required'),
  name: z.string().min(1, 'Ingredient name is required'),
  notes: z.string().optional(),
  category: z.string().optional(),
});

// Nutrition schema (optional)
export const nutritionSchema = z
  .object({
    calories: positiveNumber,
    protein: positiveNumber,
    carbs: positiveNumber,
    fat: positiveNumber,
    fiber: positiveNumber,
    sugar: positiveNumber,
    sodium: positiveNumber,
  })
  .optional();

// Base recipe form schema (without refinements)
const recipeFormBaseSchema = z.object({
  // Basic Info
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  cuisine: nonEmptyString,
  category: nonEmptyString,

  // Timing
  prepTime: z
    .number()
    .min(1, 'Prep time must be at least 1 minute')
    .max(480, 'Prep time must be less than 8 hours'),
  cookTime: z
    .number()
    .min(0, 'Cook time cannot be negative')
    .max(720, 'Cook time must be less than 12 hours'),
  totalTime: z
    .number()
    .min(1, 'Total time must be at least 1 minute')
    .max(1440, 'Total time must be less than 24 hours'),

  // Servings & Difficulty
  servings: z
    .number()
    .min(1, 'Must serve at least 1 person')
    .max(50, 'Maximum 50 servings allowed'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    required_error: 'Please select a difficulty level',
  }),

  // Images (File objects will be handled separately in the component)
  images: z.array(z.any()).default([]), // Files can't be validated with Zod directly
  primaryImageIndex: z.number().min(0).default(0),

  // Ingredients
  ingredients: z
    .array(ingredientSchema)
    .min(1, 'At least one ingredient is required')
    .max(50, 'Maximum 50 ingredients allowed'),

  // Instructions
  instructions: z
    .string()
    .min(20, 'Instructions must be at least 20 characters')
    .max(5000, 'Instructions must be less than 5000 characters'),

  // Nutrition (optional)
  nutrition: nutritionSchema,

  // Tags & Dietary
  tags: z.array(z.string()).max(20, 'Maximum 20 tags allowed').default([]),
  dietaryRestrictions: z
    .array(z.string())
    .max(10, 'Maximum 10 dietary restrictions allowed')
    .default([]),
});

// Main recipe form schema with refinements
export const recipeFormSchema = recipeFormBaseSchema.refine(
  (data) => {
    // Custom validation: total time should be at least prep + cook time
    return data.totalTime >= data.prepTime + data.cookTime;
  },
  {
    message: 'Total time must be at least prep time + cook time',
    path: ['totalTime'],
  }
);

// Step-specific schemas for individual step validation (using base schema)
export const basicInfoSchema = recipeFormBaseSchema.pick({
  title: true,
  description: true,
  cuisine: true,
  category: true,
});

export const timingSchema = recipeFormBaseSchema
  .pick({
    prepTime: true,
    cookTime: true,
    totalTime: true,
  })
  .refine(
    (data: { prepTime: number; cookTime: number; totalTime: number }) => {
      return data.totalTime >= data.prepTime + data.cookTime;
    },
    {
      message: 'Total time must be at least prep time + cook time',
      path: ['totalTime'],
    }
  );

export const servingsSchema = recipeFormBaseSchema.pick({
  servings: true,
  difficulty: true,
});

export const ingredientsSchema = recipeFormBaseSchema.pick({
  ingredients: true,
});

export const instructionsSchema = recipeFormBaseSchema.pick({
  instructions: true,
});

export const nutritionStepSchema = recipeFormBaseSchema.pick({
  nutrition: true,
});

export const tagsSchema = recipeFormBaseSchema.pick({
  tags: true,
  dietaryRestrictions: true,
});

// Type inference
export type RecipeFormData = z.infer<typeof recipeFormSchema>;
export type IngredientData = z.infer<typeof ingredientSchema>;
export type NutritionData = z.infer<typeof nutritionSchema>;

// Export individual step types
export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type TimingData = z.infer<typeof timingSchema>;
export type ServingsData = z.infer<typeof servingsSchema>;
export type IngredientsData = z.infer<typeof ingredientsSchema>;
export type InstructionsData = z.infer<typeof instructionsSchema>;
export type NutritionStepData = z.infer<typeof nutritionStepSchema>;
export type TagsData = z.infer<typeof tagsSchema>;

// Common dropdown options
export const CUISINES = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'French',
  'Indian',
  'Thai',
  'Mediterranean',
  'Greek',
  'Korean',
  'Vietnamese',
  'Spanish',
  'German',
  'British',
  'Middle Eastern',
  'Brazilian',
  'Other',
] as const;

export const CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Appetizer',
  'Snack',
  'Dessert',
  'Beverage',
  'Soup',
  'Salad',
  'Side Dish',
  'Main Course',
  'Sauce',
  'Marinade',
  'Dressing',
  'Bread',
  'Pasta',
  'Rice',
  'Other',
] as const;

export const UNITS = [
  // Volume
  'cup',
  'cups',
  'tablespoon',
  'tablespoons',
  'tbsp',
  'teaspoon',
  'teaspoons',
  'tsp',
  'fluid ounce',
  'fluid ounces',
  'fl oz',
  'pint',
  'pints',
  'quart',
  'quarts',
  'gallon',
  'gallons',
  'liter',
  'liters',
  'L',
  'milliliter',
  'milliliters',
  'ml',

  // Weight
  'pound',
  'pounds',
  'lb',
  'lbs',
  'ounce',
  'ounces',
  'oz',
  'gram',
  'grams',
  'g',
  'kilogram',
  'kilograms',
  'kg',

  // Count
  'piece',
  'pieces',
  'item',
  'items',
  'clove',
  'cloves',
  'bunch',
  'bunches',
  'head',
  'heads',
  'slice',
  'slices',
  'can',
  'cans',
  'package',
  'packages',
  'jar',
  'jars',
  'bottle',
  'bottles',

  // Measurement
  'inch',
  'inches',
  'centimeter',
  'centimeters',
  'cm',

  // Other
  'pinch',
  'dash',
  'handful',
  'to taste',
  'as needed',
] as const;

export const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Soy-Free',
  'Egg-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
  'Low-Sodium',
  'Low-Fat',
  'Sugar-Free',
  'Halal',
  'Kosher',
] as const;

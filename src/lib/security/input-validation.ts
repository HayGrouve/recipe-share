import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email().max(254);
export const passwordSchema = z.string().min(8).max(128);
export const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_-]+$/);

// Recipe validation schemas
export const recipeIdSchema = z.string().uuid();
export const recipeTitleSchema = z.string().min(1).max(200).trim();
export const recipeDescriptionSchema = z.string().max(1000).trim();
export const cookingTimeSchema = z.number().int().min(1).max(1440); // max 24 hours
export const servingsSchema = z.number().int().min(1).max(50);

// Search validation
export const searchQuerySchema = z.string().min(1).max(100).trim();
export const categorySchema = z.string().min(1).max(50).trim();

// Pagination validation
export const pageSchema = z.coerce.number().int().min(1).max(1000);
export const limitSchema = z.coerce.number().int().min(1).max(100);

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
  type: z.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/),
});

// Common patterns
export const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Sanitization functions
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - remove potentially dangerous tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');
}

export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

// Input validation middleware helper
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ),
      };
    }
    return {
      success: false,
      errors: ['Invalid input'],
    };
  }
}

// Common API request validation
export const apiRequestSchema = z.object({
  page: pageSchema.optional().default(1),
  limit: limitSchema.optional().default(10),
  sort: z.enum(['asc', 'desc']).optional().default('desc'),
  search: searchQuerySchema.optional(),
});

export const recipeCreateSchema = z.object({
  title: recipeTitleSchema,
  description: recipeDescriptionSchema,
  ingredients: z.array(z.string().min(1).max(200)).min(1).max(50),
  instructions: z.array(z.string().min(1).max(500)).min(1).max(50),
  prepTime: cookingTimeSchema.optional(),
  cookTime: cookingTimeSchema.optional(),
  servings: servingsSchema.optional(),
  category: categorySchema.optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  isPublic: z.boolean().default(true),
});

export const recipeUpdateSchema = recipeCreateSchema.partial();

// User input validation
export const userProfileUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).trim().optional(),
  bio: z.string().max(500).trim().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).trim().optional(),
});

// Comment validation
export const commentCreateSchema = z.object({
  content: z.string().min(1).max(1000).trim(),
  recipeId: recipeIdSchema,
});

// Rating validation
export const ratingCreateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  recipeId: recipeIdSchema,
  comment: z.string().max(500).trim().optional(),
});

export type RecipeCreateInput = z.infer<typeof recipeCreateSchema>;
export type RecipeUpdateInput = z.infer<typeof recipeUpdateSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type RatingCreateInput = z.infer<typeof ratingCreateSchema>;
export type ApiRequestInput = z.infer<typeof apiRequestSchema>;

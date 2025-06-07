// Recipe types for the application
export interface RecipeWithDetails {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  servings: number | null;
  prepTime: number | null;
  cookTime: number | null;
  totalTime: number | null;
  difficulty: string | null;
  isPublic: boolean;
  slug: string | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    avatar: string | null;
  };
  ingredients: RecipeIngredientWithDetails[];
  instructions: InstructionWithDetails[];
  images: RecipeImageWithDetails[];
  nutrition: NutritionWithDetails | null;
  categories: RecipeCategoryWithDetails[];
  tags: RecipeTagWithDetails[];
  ratings: RatingWithUser[];
  comments: CommentWithUser[];
  _count: {
    ratings: number;
    comments: number;
    saves: number;
  };
}

export interface RecipeIngredientWithDetails {
  id: string;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
  ingredient: {
    id: string;
    name: string;
    unit: string | null;
  };
}

export interface InstructionWithDetails {
  id: string;
  stepNumber: number;
  content: string;
  timeMinutes: number | null;
}

export interface RecipeImageWithDetails {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  isPrimary: boolean;
}

export interface NutritionWithDetails {
  id: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  cholesterol: number | null;
  saturatedFat: number | null;
}

export interface RecipeCategoryWithDetails {
  category: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    color: string | null;
    icon: string | null;
  };
}

export interface RecipeTagWithDetails {
  tag: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface RatingWithUser {
  id: string;
  score: number;
  review: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    avatar: string | null;
  };
}

export interface CommentWithUser {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    avatar: string | null;
  };
}

// Form types for creating/updating recipes
export interface CreateRecipeData {
  title: string;
  description?: string;
  content?: string;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  isPublic?: boolean;
  ingredients: CreateRecipeIngredient[];
  instructions: CreateRecipeInstruction[];
  categories?: string[]; // category IDs
  tags?: string[]; // tag names
  nutrition?: CreateNutritionData;
}

export interface CreateRecipeIngredient {
  ingredientName: string;
  quantity?: string;
  unit?: string;
  notes?: string;
}

export interface CreateRecipeInstruction {
  stepNumber: number;
  content: string;
  timeMinutes?: number;
}

export interface CreateNutritionData {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  saturatedFat?: number;
}

// Search and filter types
export interface RecipeFilters {
  category?: string;
  tags?: string[];
  difficulty?: string;
  maxPrepTime?: number;
  maxCookTime?: number;
  minRating?: number;
  authorId?: string;
  search?: string;
}

export interface RecipeSearchResult {
  recipes: RecipeWithDetails[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

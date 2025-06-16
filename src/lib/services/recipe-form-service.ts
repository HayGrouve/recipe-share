import { RecipeFormData } from '@/lib/validations/recipe';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateRecipeResponse {
  recipe: {
    id: string;
    title: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RecipeWithDetails {
  id: string;
  title: string;
  description: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  author?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
}

export class RecipeFormService {
  private static readonly BASE_URL = '/api/recipes';

  /**
   * Create a new recipe
   */
  static async createRecipe(
    data: RecipeFormData
  ): Promise<ApiResponse<CreateRecipeResponse>> {
    try {
      const payload = this.transformFormDataToApiPayload(data);

      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `Failed to create recipe: ${response.status}`,
        };
      }

      return {
        success: true,
        data: result,
        message: 'Recipe created successfully!',
      };
    } catch (error) {
      console.error('Error creating recipe:', error);
      return {
        success: false,
        error:
          'Network error occurred while creating recipe. Please try again.',
      };
    }
  }

  /**
   * Update an existing recipe
   */
  static async updateRecipe(
    recipeId: string,
    data: RecipeFormData
  ): Promise<ApiResponse<CreateRecipeResponse>> {
    try {
      const payload = this.transformFormDataToApiPayload(data);

      const response = await fetch(`${this.BASE_URL}/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `Failed to update recipe: ${response.status}`,
        };
      }

      return {
        success: true,
        data: result,
        message: 'Recipe updated successfully!',
      };
    } catch (error) {
      console.error('Error updating recipe:', error);
      return {
        success: false,
        error:
          'Network error occurred while updating recipe. Please try again.',
      };
    }
  }

  /**
   * Delete a recipe
   */
  static async deleteRecipe(recipeId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${recipeId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `Failed to delete recipe: ${response.status}`,
        };
      }

      return {
        success: true,
        message: 'Recipe deleted successfully!',
      };
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return {
        success: false,
        error:
          'Network error occurred while deleting recipe. Please try again.',
      };
    }
  }

  /**
   * Get a recipe for editing
   */
  static async getRecipe(
    recipeId: string
  ): Promise<ApiResponse<{ recipe: RecipeWithDetails }>> {
    try {
      const response = await fetch(`${this.BASE_URL}/${recipeId}`);
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `Failed to fetch recipe: ${response.status}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching recipe:', error);
      return {
        success: false,
        error:
          'Network error occurred while fetching recipe. Please try again.',
      };
    }
  }

  /**
   * Duplicate a recipe (create a copy with modified title)
   */
  static async duplicateRecipe(
    recipeId: string,
    newTitle?: string
  ): Promise<ApiResponse<CreateRecipeResponse>> {
    try {
      // First, fetch the original recipe
      const originalResponse = await this.getRecipe(recipeId);

      if (!originalResponse.success || !originalResponse.data) {
        return {
          success: false,
          error: 'Failed to fetch original recipe for duplication',
        };
      }

      const originalRecipe = originalResponse.data.recipe;

      // Transform the original recipe data back to form format
      const formData: RecipeFormData =
        this.transformApiDataToFormData(originalRecipe);

      // Modify the title to indicate it's a copy
      formData.title = newTitle || `Copy of ${originalRecipe.title}`;

      // Create the duplicate
      return await this.createRecipe(formData);
    } catch (error) {
      console.error('Error duplicating recipe:', error);
      return {
        success: false,
        error:
          'Network error occurred while duplicating recipe. Please try again.',
      };
    }
  }

  /**
   * Transform form data to API payload format
   */
  private static transformFormDataToApiPayload(data: RecipeFormData) {
    return {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      servings: data.servings,
      isPublished: true, // Default to published for now
      ingredients: data.ingredients.map((ingredient) => ({
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        name: ingredient.name,
        notes: ingredient.notes || '',
        category: ingredient.category || '',
      })),
      images: data.images,
      tags: data.tags,
      categories: [data.category], // Convert single category to array
      nutrition: data.nutrition,
    };
  }

  /**
   * Transform API data back to form data format
   */
  private static transformApiDataToFormData(
    recipe: RecipeWithDetails
  ): RecipeFormData {
    return {
      title: recipe.title,
      description: recipe.description,
      cuisine: '', // TODO: Add cuisine to recipe schema
      category: '', // TODO: Extract from categories relationship
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.prepTime + recipe.cookTime, // Calculate total time
      servings: recipe.servings,
      difficulty: 'medium' as const, // TODO: Add difficulty to recipe schema
      images: [], // TODO: Extract from recipe images relationship
      primaryImageIndex: 0,
      ingredients: [], // TODO: Extract from recipe ingredients relationship
      instructions: recipe.instructions,
      nutrition: undefined, // TODO: Extract from nutrition relationship
      tags: [], // TODO: Extract from recipe tags relationship
      dietaryRestrictions: [], // TODO: Add dietary restrictions support
    };
  }

  /**
   * Save draft to localStorage
   */
  static saveDraft(data: RecipeFormData, recipeId?: string): void {
    try {
      const key = recipeId ? `recipe-draft-${recipeId}` : 'recipe-draft-new';
      const draftData = {
        ...data,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(draftData));
    } catch (error) {
      console.warn('Failed to save draft to localStorage:', error);
    }
  }

  /**
   * Load draft from localStorage
   */
  static loadDraft(recipeId?: string): RecipeFormData | null {
    try {
      const key = recipeId ? `recipe-draft-${recipeId}` : 'recipe-draft-new';
      const draftJson = localStorage.getItem(key);

      if (!draftJson) return null;

      const draftData = JSON.parse(draftJson);

      // Check if draft is less than 24 hours old
      const savedAt = new Date(draftData.savedAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        // Remove old draft
        localStorage.removeItem(key);
        return null;
      }

      // Remove the savedAt timestamp before returning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { savedAt: _, ...formData } = draftData;
      return formData as RecipeFormData;
    } catch (error) {
      console.warn('Failed to load draft from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear draft from localStorage
   */
  static clearDraft(recipeId?: string): void {
    try {
      const key = recipeId ? `recipe-draft-${recipeId}` : 'recipe-draft-new';
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear draft from localStorage:', error);
    }
  }
}

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RecipeFormData, recipeFormSchema } from '@/lib/validations/recipe';
import {
  RecipeFormService,
  ApiResponse,
  CreateRecipeResponse,
} from '@/lib/services/recipe-form-service';

export interface UseRecipeFormOptions {
  defaultValues?: Partial<RecipeFormData>;
  autoSave?: boolean;
  autoSaveInterval?: number; // in milliseconds
}

export interface UseRecipeFormReturn {
  form: UseFormReturn<RecipeFormData>;
  isSubmitting: boolean;
  isDraft: boolean;
  formMode: 'create' | 'edit';
  recipeId: string | null;
  isLoading: boolean;

  // Actions
  handleSubmit: (data: RecipeFormData) => Promise<void>;
  handleSaveAsDraft: () => void;
  handleDelete: () => Promise<void>;
  handleDuplicate: (newTitle?: string) => Promise<void>;

  // State
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
}

const defaultFormValues: RecipeFormData = {
  title: '',
  description: '',
  cuisine: '',
  category: '',
  prepTime: 15,
  cookTime: 30,
  totalTime: 45,
  servings: 4,
  difficulty: 'medium',
  images: [],
  primaryImageIndex: 0,
  ingredients: [
    {
      id: '1',
      quantity: '',
      unit: '',
      name: '',
      notes: '',
      category: '',
    },
  ],
  instructions: '',
  nutrition: undefined,
  tags: [],
  dietaryRestrictions: [],
};

export function useRecipeForm(
  options: UseRecipeFormOptions = {}
): UseRecipeFormReturn {
  const {
    defaultValues = defaultFormValues,
    autoSave = true,
    autoSaveInterval = 30000, // 30 seconds
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract form mode and recipe ID from URL params
  const formMode = (searchParams.get('mode') as 'create' | 'edit') || 'create';
  const recipeId = searchParams.get('id');

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Initialize form
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { watch, reset, getValues, formState } = form;

  // Load existing recipe data for edit mode
  useEffect(() => {
    if (formMode === 'edit' && recipeId) {
      setIsLoading(true);
      RecipeFormService.getRecipe(recipeId)
        .then((response) => {
          if (response.success && response.data) {
            // TODO: Transform API data to form data properly
            // For now, we'll use a simplified approach
            const recipe = response.data.recipe;
            reset({
              ...defaultFormValues,
              title: recipe.title,
              description: recipe.description,
              instructions: recipe.instructions,
              prepTime: recipe.prepTime,
              cookTime: recipe.cookTime,
              totalTime: recipe.prepTime + recipe.cookTime,
              servings: recipe.servings,
            });
            setIsDraft(false);
          } else {
            toast.error(response.error || 'Failed to load recipe');
            router.push('/recipes/create');
          }
        })
        .catch((error) => {
          console.error('Error loading recipe:', error);
          toast.error('Failed to load recipe');
          router.push('/recipes/create');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [formMode, recipeId, reset, router]);

  // Load draft from localStorage on mount for new recipes
  useEffect(() => {
    if (formMode === 'create' && !recipeId) {
      const draft = RecipeFormService.loadDraft();
      if (draft) {
        reset(draft);
        setIsDraft(true);
        setLastSavedAt(new Date());
        toast.info('Draft loaded from previous session');
      }
    }
  }, [formMode, recipeId, reset]);

  // Track form changes
  useEffect(() => {
    const subscription = watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Auto-save functionality
  const handleAutoSave = useCallback(() => {
    if (autoSave && hasUnsavedChanges && formState.isValid) {
      const currentData = getValues();
      RecipeFormService.saveDraft(currentData, recipeId || undefined);
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
    }
  }, [autoSave, hasUnsavedChanges, formState.isValid, getValues, recipeId]);

  // Auto-save timer
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      const timer = setTimeout(handleAutoSave, autoSaveInterval);
      return () => clearTimeout(timer);
    }
  }, [autoSave, hasUnsavedChanges, handleAutoSave, autoSaveInterval]);

  // Manual save as draft
  const handleSaveAsDraft = useCallback(() => {
    const currentData = getValues();
    RecipeFormService.saveDraft(currentData, recipeId || undefined);
    setLastSavedAt(new Date());
    setHasUnsavedChanges(false);
    setIsDraft(true);
    toast.success('Draft saved successfully');
  }, [getValues, recipeId]);

  // Form submission
  const handleSubmit = useCallback(
    async (data: RecipeFormData) => {
      setIsSubmitting(true);

      try {
        let response: ApiResponse<CreateRecipeResponse>;

        if (formMode === 'edit' && recipeId) {
          response = await RecipeFormService.updateRecipe(recipeId, data);
        } else {
          response = await RecipeFormService.createRecipe(data);
        }

        if (response.success) {
          // Clear draft after successful submission
          RecipeFormService.clearDraft(recipeId || undefined);
          setIsDraft(false);
          setHasUnsavedChanges(false);

          toast.success(response.message || 'Recipe saved successfully!');

          // Navigate to the recipe page or list
          if (formMode === 'create' && response.data?.recipe?.id) {
            router.push(`/recipes/${response.data.recipe.id}`);
          } else if (formMode === 'edit') {
            router.push(`/recipes/${recipeId}`);
          } else {
            router.push('/recipes');
          }
        } else {
          toast.error(response.error || 'Failed to save recipe');
        }
      } catch (error) {
        console.error('Submission error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [formMode, recipeId, router]
  );

  // Delete recipe
  const handleDelete = useCallback(async () => {
    if (!recipeId) {
      toast.error('No recipe to delete');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await RecipeFormService.deleteRecipe(recipeId);

      if (response.success) {
        toast.success(response.message || 'Recipe deleted successfully');
        router.push('/recipes');
      } else {
        toast.error(response.error || 'Failed to delete recipe');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An unexpected error occurred while deleting');
    } finally {
      setIsSubmitting(false);
    }
  }, [recipeId, router]);

  // Duplicate recipe
  const handleDuplicate = useCallback(
    async (newTitle?: string) => {
      if (!recipeId) {
        toast.error('No recipe to duplicate');
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await RecipeFormService.duplicateRecipe(
          recipeId,
          newTitle
        );

        if (response.success) {
          toast.success('Recipe duplicated successfully');
          if (response.data?.recipe?.id) {
            router.push(
              `/recipes/create?mode=edit&id=${response.data.recipe.id}`
            );
          } else {
            router.push('/recipes/create');
          }
        } else {
          toast.error(response.error || 'Failed to duplicate recipe');
        }
      } catch (error) {
        console.error('Duplicate error:', error);
        toast.error('An unexpected error occurred while duplicating');
      } finally {
        setIsSubmitting(false);
      }
    },
    [recipeId, router]
  );

  // Clean up draft on unmount if form was successfully submitted
  useEffect(() => {
    return () => {
      if (!isDraft && !hasUnsavedChanges) {
        RecipeFormService.clearDraft(recipeId || undefined);
      }
    };
  }, [isDraft, hasUnsavedChanges, recipeId]);

  return {
    form,
    isSubmitting,
    isDraft,
    formMode,
    recipeId,
    isLoading,
    handleSubmit,
    handleSaveAsDraft,
    handleDelete,
    handleDuplicate,
    hasUnsavedChanges,
    lastSavedAt,
  };
}

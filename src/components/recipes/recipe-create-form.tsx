'use client';

import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  Eye,
  AlertCircle,
  Trash2,
  Copy,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import IngredientsStep from './form-steps/ingredients-step';
import ImagesStep from './form-steps/images-step';
import DeleteConfirmationModal from './delete-confirmation-modal';
import { useRecipeForm } from '@/hooks/use-recipe-form';
import { type RecipeFormData } from '@/lib/validations/recipe';

// Form step interface
interface FormStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
}

export default function RecipeCreateForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Use the custom recipe form hook
  const {
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
  } = useRecipeForm();

  const {
    formState: { errors },
    trigger,
    watch,
    getValues,
  } = form;

  // Watch form values for auto-save and progress tracking
  const watchedValues = watch();

  const steps: FormStep[] = [
    {
      id: 1,
      title: 'Basic Info',
      description: 'Recipe name, description, and category',
      isComplete: isStepComplete(1),
    },
    {
      id: 2,
      title: 'Timing',
      description: 'Preparation and cooking times',
      isComplete: isStepComplete(2),
    },
    {
      id: 3,
      title: 'Servings & Difficulty',
      description: 'Number of servings and difficulty level',
      isComplete: isStepComplete(3),
    },
    {
      id: 4,
      title: 'Images',
      description: 'Upload recipe photos',
      isComplete: isStepComplete(4),
    },
    {
      id: 5,
      title: 'Ingredients',
      description: 'List all ingredients with measurements',
      isComplete: isStepComplete(5),
    },
    {
      id: 6,
      title: 'Instructions',
      description: 'Step-by-step cooking instructions',
      isComplete: isStepComplete(6),
    },
    {
      id: 7,
      title: 'Nutrition',
      description: 'Optional nutritional information',
      isComplete: isStepComplete(7),
    },
    {
      id: 8,
      title: 'Tags & Dietary',
      description: 'Tags and dietary restrictions',
      isComplete: isStepComplete(8),
    },
  ];

  function isStepComplete(stepId: number): boolean {
    const values = getValues();

    switch (stepId) {
      case 1:
        return !!(
          values.title &&
          values.description &&
          values.cuisine &&
          values.category
        );
      case 2:
        return !!(values.prepTime && values.cookTime && values.totalTime);
      case 3:
        return !!(values.servings && values.difficulty);
      case 4:
        return true; // Images are optional
      case 5:
        return (
          values.ingredients?.length > 0 &&
          values.ingredients.every(
            (ing) => ing.quantity && ing.unit && ing.name
          )
        );
      case 6:
        return !!(values.instructions && values.instructions.length >= 20);
      case 7:
        return true; // Nutrition is optional
      case 8:
        return true; // Tags are optional
      default:
        return false;
    }
  }

  const validateCurrentStep = async () => {
    // Validate specific fields based on current step
    switch (currentStep) {
      case 1:
        return await trigger(['title', 'description', 'cuisine', 'category']);
      case 2:
        return await trigger(['prepTime', 'cookTime', 'totalTime']);
      case 3:
        return await trigger(['servings', 'difficulty']);
      case 4:
        return true; // Images validation will be handled in step component
      case 5:
        return await trigger(['ingredients']);
      case 6:
        return await trigger(['instructions']);
      case 7:
        return await trigger(['nutrition']);
      case 8:
        return await trigger(['tags', 'dietaryRestrictions']);
      default:
        return true;
    }
  };

  const goToStep = async (stepId: number) => {
    if (stepId < currentStep || (await validateCurrentStep())) {
      setCurrentStep(stepId);
    }
  };

  const nextStep = async () => {
    if ((await validateCurrentStep()) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RecipeFormData) => {
    await handleSubmit(data);
  };

  const progressPercentage =
    (steps.filter((step) => step.isComplete).length / steps.length) * 100;
  const isFormValid = steps.slice(0, 6).every((step) => step.isComplete); // Required steps 1-6

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center text-gray-500">
              <p>Basic Info step content will be implemented next.</p>
              <p className="mt-2 text-sm">
                Title, description, cuisine, and category fields.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center text-gray-500">
              <p>Timing step content will be implemented next.</p>
              <p className="mt-2 text-sm">
                Prep time, cook time, and total time fields.
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center text-gray-500">
              <p>
                Servings & Difficulty step content will be implemented next.
              </p>
              <p className="mt-2 text-sm">
                Number of servings and difficulty level selectors.
              </p>
            </div>
          </div>
        );
      case 4:
        return <ImagesStep />;
      case 5:
        return <IngredientsStep />;
      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center text-gray-500">
              <p>Instructions step content will be implemented next.</p>
              <p className="mt-2 text-sm">
                Rich text editor for cooking instructions.
              </p>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center text-gray-500">
              <p>Nutrition step content will be implemented next.</p>
              <p className="mt-2 text-sm">
                Optional nutritional information fields.
              </p>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <div className="text-center text-gray-500">
              <p>Tags & Dietary step content will be implemented next.</p>
              <p className="mt-2 text-sm">
                Tags and dietary restriction selections.
              </p>
            </div>
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <FormProvider {...form}>
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="false" className="sr-only">
        {isSubmitting && <span>Submitting recipe form...</span>}
        {Object.keys(errors).length > 0 && (
          <span>Form has {Object.keys(errors).length} validation errors</span>
        )}
      </div>

      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {formMode === 'edit' ? 'Edit Recipe' : 'Create Recipe'}
            </h1>
            <div
              className="mt-2 text-sm text-gray-600 sm:text-base"
              role="status"
              aria-live="polite"
            >
              {isDraft && (
                <span className="inline-flex items-center gap-1 text-orange-600">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  <span>Draft - Auto-saving</span>
                  {lastSavedAt && (
                    <span className="ml-2 text-xs text-gray-500">
                      Last saved: {lastSavedAt.toLocaleTimeString()}
                    </span>
                  )}
                </span>
              )}
              {hasUnsavedChanges && !isDraft && (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Unsaved changes</span>
                </span>
              )}
            </div>
          </div>

          {/* Action buttons - responsive layout */}
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            {formMode === 'edit' && recipeId && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDuplicate()}
                  disabled={isSubmitting}
                  aria-label="Create a duplicate copy of this recipe"
                  className="flex min-h-[44px] items-center gap-2"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Duplicate</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isSubmitting}
                  aria-label="Delete this recipe permanently"
                  className="flex min-h-[44px] items-center gap-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsDraft}
              disabled={isSubmitting}
              aria-label="Save current progress as draft"
              className="flex min-h-[44px] items-center gap-2"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              aria-label={
                previewMode ? 'Return to editing mode' : 'Preview recipe'
              }
              aria-pressed={previewMode}
              className="flex min-h-[44px] items-center gap-2"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
            <span>Form Progress</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-gray-200"
            role="progressbar"
            aria-valuenow={Math.round(progressPercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Recipe form completion: ${Math.round(progressPercentage)} percent`}
          >
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <nav aria-label="Recipe form steps" className="mb-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-8">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                disabled={isSubmitting}
                aria-current={currentStep === step.id ? 'step' : undefined}
                aria-label={`${step.title}: ${step.isComplete ? 'Complete' : 'Incomplete'}${currentStep === step.id ? ' (current)' : ''}`}
                className={cn(
                  'rounded-lg p-3 text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50',
                  'min-h-[44px] min-w-[44px]', // Ensure minimum touch target size
                  currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : step.isComplete
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <div className="flex items-center justify-center gap-1">
                  {step.isComplete && (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline" aria-hidden="true">
                    {step.title}
                  </span>
                  <span className="sm:hidden" aria-hidden="true">
                    {step.id}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Form Content */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Current Step Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Step {currentStep}: {steps[currentStep - 1]?.title}
                </h2>
                <p className="mt-1 text-gray-600">
                  {steps[currentStep - 1]?.description}
                </p>

                {/* Show validation errors for current step */}
                {Object.keys(errors).length > 0 && (
                  <div
                    id="form-errors"
                    role="alert"
                    aria-live="polite"
                    className="mt-3 rounded-md border border-red-200 bg-red-50 p-3"
                  >
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      <span className="font-medium">
                        Please fix the following errors:
                      </span>
                    </div>
                    <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                      {errors.title && <li>Recipe title is required</li>}
                      {errors.description && (
                        <li>Recipe description is required</li>
                      )}
                      {errors.instructions && (
                        <li>Cooking instructions are required</li>
                      )}
                      {errors.ingredients && (
                        <li>
                          Please check your ingredients for missing or invalid
                          information
                        </li>
                      )}
                      {errors.prepTime && (
                        <li>Preparation time must be a valid number</li>
                      )}
                      {errors.cookTime && (
                        <li>Cooking time must be a valid number</li>
                      )}
                      {errors.servings && (
                        <li>Number of servings must be a valid number</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">{renderStepContent()}</div>

              {/* Navigation Buttons */}
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSubmitting}
                  aria-label={`Go to previous step: ${steps[currentStep - 2]?.title || 'Previous step'}`}
                  className="order-2 flex min-h-[44px] items-center justify-center gap-2 sm:order-1"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </Button>

                <div className="order-1 flex gap-2 sm:order-2">
                  {currentStep === steps.length ? (
                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      aria-describedby={
                        !isFormValid ? 'form-errors' : undefined
                      }
                      className="flex min-h-[44px] flex-1 items-center gap-2 sm:flex-initial"
                    >
                      <Save className="h-4 w-4" aria-hidden="true" />
                      {isSubmitting ? 'Publishing...' : 'Publish Recipe'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      aria-label={`Go to next step: ${steps[currentStep]?.title || 'Next step'}`}
                      className="flex min-h-[44px] flex-1 items-center gap-2 sm:flex-initial"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Debug Info (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h3 className="mb-2 font-medium">Debug Info</h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div>
                  <strong>Current Step:</strong> {currentStep}
                </div>
                <div>
                  <strong>Form Valid:</strong> {isFormValid ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Progress:</strong> {Math.round(progressPercentage)}%
                </div>
              </div>
              {Object.keys(errors).length > 0 && (
                <div className="mt-2">
                  <strong>Errors:</strong>
                  <pre className="mt-1 max-h-32 overflow-auto rounded bg-white p-2 text-xs">
                    {JSON.stringify(errors, null, 2)}
                  </pre>
                </div>
              )}
              <div className="mt-2">
                <strong>Ingredients:</strong>
                <pre className="mt-1 max-h-32 overflow-auto rounded bg-white p-2 text-xs">
                  {JSON.stringify(watchedValues.ingredients, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="loading-title"
            aria-describedby="loading-description"
          >
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                <div>
                  <div id="loading-title" className="font-medium">
                    Loading recipe...
                  </div>
                  <div
                    id="loading-description"
                    className="text-sm text-gray-500"
                  >
                    Please wait while we load your recipe data
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          recipeTitle={watch('title') || 'this recipe'}
          isDeleting={isSubmitting}
        />
      </div>
    </FormProvider>
  );
}

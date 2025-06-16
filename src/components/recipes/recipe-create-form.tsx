'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import IngredientsStep from './form-steps/ingredients-step';
import ImagesStep from './form-steps/images-step';
import {
  // recipeFormSchema, // TODO: Re-enable when type mismatch is fixed
  type RecipeFormData,
} from '@/lib/validations/recipe';

// Form step interface
interface FormStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
}

const defaultValues: Partial<RecipeFormData> = {
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
  tags: [],
  dietaryRestrictions: [],
};

export default function RecipeCreateForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDraft, setIsDraft] = useState(true);

  // Initialize React Hook Form (temporarily without schema validation)
  const methods = useForm<RecipeFormData>({
    // resolver: zodResolver(recipeFormSchema), // TODO: Fix type mismatch
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch,
    getValues,
  } = methods;

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
    try {
      console.log('Submitting recipe:', data);
      // TODO: Implement recipe submission logic
      setIsDraft(false);
    } catch (error) {
      console.error('Error submitting recipe:', error);
    }
  };

  const handleAutoSave = React.useCallback(() => {
    // TODO: Implement auto-save functionality
    console.log('Auto-saving draft...', watchedValues);
  }, [watchedValues]);

  // Auto-save every 30 seconds when form is dirty
  React.useEffect(() => {
    if (isDraft && Object.keys(errors).length === 0) {
      const autoSaveTimer = setTimeout(handleAutoSave, 30000);
      return () => clearTimeout(autoSaveTimer);
    }
  }, [watchedValues, errors, isDraft, handleAutoSave]);

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
    <FormProvider {...methods}>
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Recipe</h1>
            <p className="mt-2 text-gray-600">
              {isDraft && (
                <span className="inline-flex items-center gap-1 text-orange-600">
                  <Save className="h-4 w-4" />
                  Draft - Auto-saving
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Navigation */}
        <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              className={cn(
                'rounded-lg p-3 text-sm font-medium transition-all',
                currentStep === step.id
                  ? 'bg-blue-600 text-white'
                  : step.isComplete
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <div className="flex items-center justify-center gap-1">
                {step.isComplete && <Check className="h-3 w-3" />}
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.id}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Current Step Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Step {currentStep}: {steps[currentStep - 1]?.title}
                </h2>
                <p className="mt-1 text-gray-600">
                  {steps[currentStep - 1]?.description}
                </p>

                {/* Show validation errors for current step */}
                {Object.keys(errors).length > 0 && currentStep === 5 && (
                  <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">
                        Please fix the following errors:
                      </span>
                    </div>
                    <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                      {errors.ingredients && (
                        <li>
                          Please check your ingredients for missing or invalid
                          information
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">{renderStepContent()}</div>

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentStep === steps.length ? (
                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? 'Publishing...' : 'Publish Recipe'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
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
      </div>
    </FormProvider>
  );
}

'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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

// Form step interface
interface FormStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
}

// Local form data interface (will be synced with Zod schema in next subtask)
interface RecipeFormData {
  // Basic Info
  title: string;
  description: string;
  cuisine: string;
  category: string;

  // Timing
  prepTime: number;
  cookTime: number;
  totalTime: number;

  // Servings & Difficulty
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';

  // Images
  images: File[];
  primaryImageIndex: number;

  // Ingredients
  ingredients: Array<{
    id: string;
    quantity: string;
    unit: string;
    name: string;
    notes?: string;
    category?: string;
  }>;

  // Instructions
  instructions: string;

  // Nutrition (optional)
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };

  // Tags & Dietary
  tags: string[];
  dietaryRestrictions: string[];
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
  nutrition: undefined,
  tags: [],
  dietaryRestrictions: [],
};

export default function RecipeCreateForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDraft, setIsDraft] = useState(true);

  // Initialize React Hook Form (validation will be added in next subtask)
  const methods = useForm<RecipeFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
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

  const goToStep = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
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

  const handleAutoSave = () => {
    // TODO: Implement auto-save functionality
    console.log('Auto-saving draft...', watchedValues);
  };

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
                {Object.keys(errors).length > 0 && (
                  <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">
                        Please fix the following errors:
                      </span>
                    </div>
                    <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>
                          {field}: {error?.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Step Content - Placeholder for now */}
              <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Step {currentStep} Content
                  </h3>
                  <p className="text-gray-600">
                    Form fields for {steps[currentStep - 1]?.title} will be
                    implemented in the next subtask.
                  </p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Current form values (for testing):</p>
                    <pre className="mt-2 max-w-md overflow-auto rounded border bg-white p-3 text-left text-xs">
                      {JSON.stringify(watchedValues, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

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
                  <pre className="mt-1 overflow-auto rounded bg-white p-2 text-xs">
                    {JSON.stringify(errors, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </FormProvider>
  );
}

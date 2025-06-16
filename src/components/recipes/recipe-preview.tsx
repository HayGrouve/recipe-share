'use client';

import React from 'react';
import Image from 'next/image';
import {
  Clock,
  Users,
  ChefHat,
  Timer,
  AlertCircle,
  User,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecipeIngredients } from '@/components/recipes/recipe-ingredients';
import { RecipeInstructions } from '@/components/recipes/recipe-instructions';
import { RecipeNutrition } from '@/components/recipes/recipe-nutrition';
import type { RecipeFormData } from '@/lib/validations/recipe';

interface RecipePreviewProps {
  formData: RecipeFormData;
  className?: string;
}

interface PreviewIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category?: string;
  notes?: string;
}

interface PreviewInstructionStep {
  id: string;
  stepNumber: number;
  instruction: string;
  timerMinutes?: number;
  imageUrl?: string;
  imageCaption?: string;
  tips?: string;
  temperature?: string;
}

interface PreviewNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  saturatedFat: number;
  transFat: number;
  vitaminA?: number;
  vitaminC?: number;
  calcium?: number;
  iron?: number;
}

export function RecipePreview({
  formData,
  className = '',
}: RecipePreviewProps) {
  // Transform form data to display-compatible format
  const transformIngredients = (): PreviewIngredient[] => {
    return (formData.ingredients || [])
      .filter((ing) => ing.name.trim() && ing.quantity.trim())
      .map((ing, index) => ({
        id: ing.id || index.toString(),
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category || 'Other',
        notes: ing.notes,
      }));
  };

  const transformInstructions = (): PreviewInstructionStep[] => {
    if (!formData.instructions) return [];

    // Parse HTML content and create instruction steps
    // For now, we'll use a simple approach - split by HTML list items or paragraphs
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formData.instructions;

    const listItems = tempDiv.querySelectorAll('li');
    const paragraphs = tempDiv.querySelectorAll('p');

    let steps: PreviewInstructionStep[] = [];

    if (listItems.length > 0) {
      // Use list items as steps
      steps = Array.from(listItems).map((li, index) => ({
        id: `step-${index + 1}`,
        stepNumber: index + 1,
        instruction: li.textContent || '',
      }));
    } else if (paragraphs.length > 0) {
      // Use paragraphs as steps
      steps = Array.from(paragraphs)
        .filter((p) => p.textContent?.trim())
        .map((p, index) => ({
          id: `step-${index + 1}`,
          stepNumber: index + 1,
          instruction: p.textContent || '',
        }));
    } else {
      // Fallback: split by line breaks
      const lines = formData.instructions
        .replace(/<[^>]*>/g, '') // Strip HTML tags
        .split('\n')
        .filter((line) => line.trim());

      steps = lines.map((line, index) => ({
        id: `step-${index + 1}`,
        stepNumber: index + 1,
        instruction: line.trim(),
      }));
    }

    return steps;
  };

  const transformNutrition = (): PreviewNutrition | null => {
    if (!formData.nutrition) return null;

    return {
      calories: formData.nutrition.calories || 0,
      protein: formData.nutrition.protein || 0,
      carbs: formData.nutrition.carbs || 0,
      fat: formData.nutrition.fat || 0,
      fiber: formData.nutrition.fiber || 0,
      sugar: formData.nutrition.sugar || 0,
      sodium: formData.nutrition.sodium || 0,
      cholesterol: 0, // Not in form schema, using default
      saturatedFat: 0, // Not in form schema, using default
      transFat: 0, // Not in form schema, using default
    };
  };

  const formatTime = (minutes?: number): string => {
    if (!minutes) return 'Not specified';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getDifficultyColor = (difficulty?: string): string => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'hard':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const previewIngredients = transformIngredients();
  const previewInstructions = transformInstructions();
  const previewNutrition = transformNutrition();

  // Check for missing critical data
  const missingData = [];
  if (!formData.title?.trim()) missingData.push('title');
  if (!formData.description?.trim()) missingData.push('description');
  if (previewIngredients.length === 0) missingData.push('ingredients');
  if (previewInstructions.length === 0) missingData.push('instructions');

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Preview Header */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">Recipe Preview</h3>
            <p className="text-sm text-blue-700">
              This is how your recipe will appear to readers.
              {missingData.length > 0 && (
                <span className="ml-1">Missing: {missingData.join(', ')}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Missing Data Warning */}
      {missingData.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-900">
                  Incomplete Recipe Data
                </h4>
                <p className="text-sm text-orange-700">
                  The following fields are missing or incomplete:{' '}
                  {missingData.join(', ')}. Please complete these sections for
                  the best preview experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipe Header */}
      <div className="space-y-6">
        {/* Title and Author */}
        <div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            {formData.title || 'Untitled Recipe'}
          </h1>

          {/* Author Info (Mock) */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">You</p>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Preview Badge */}
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700"
            >
              Preview Mode
            </Badge>
          </div>

          {/* Description */}
          {formData.description && (
            <p className="text-lg leading-relaxed text-gray-700">
              {formData.description}
            </p>
          )}
        </div>

        {/* Main Recipe Image */}
        {formData.images && formData.images.length > 0 && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={formData.images[formData.primaryImageIndex || 0]}
              alt={formData.title || 'Recipe image'}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Recipe Stats */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {/* Prep Time */}
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium tracking-wide text-gray-500 uppercase">
                    Prep Time
                  </span>
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  {formatTime(formData.prepTime)}
                </p>
              </div>

              {/* Cook Time */}
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Timer className="mr-2 h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium tracking-wide text-gray-500 uppercase">
                    Cook Time
                  </span>
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  {formatTime(formData.cookTime)}
                </p>
              </div>

              {/* Servings */}
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Users className="mr-2 h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium tracking-wide text-gray-500 uppercase">
                    Servings
                  </span>
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  {formData.servings || 'Not specified'}
                </p>
              </div>

              {/* Difficulty */}
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <ChefHat className="mr-2 h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium tracking-wide text-gray-500 uppercase">
                    Difficulty
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={getDifficultyColor(formData.difficulty)}
                >
                  {formData.difficulty || 'Not specified'}
                </Badge>
              </div>
            </div>

            {/* Additional Info Row */}
            {(formData.cuisine || formData.category || formData.totalTime) && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  {formData.totalTime && (
                    <div className="text-center">
                      <span className="text-gray-500">Total Time:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formatTime(formData.totalTime)}
                      </span>
                    </div>
                  )}
                  {formData.cuisine && (
                    <div className="text-center">
                      <span className="text-gray-500">Cuisine:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formData.cuisine}
                      </span>
                    </div>
                  )}
                  {formData.category && (
                    <div className="text-center">
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formData.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ingredients Section */}
      {previewIngredients.length > 0 && (
        <RecipeIngredients
          ingredients={previewIngredients}
          originalServings={formData.servings || 4}
          className="mb-8"
        />
      )}

      {/* Instructions Section */}
      {previewInstructions.length > 0 && (
        <RecipeInstructions
          instructions={previewInstructions}
          className="mb-8"
        />
      )}

      {/* Nutrition Section */}
      {previewNutrition && (
        <RecipeNutrition
          nutrition={previewNutrition}
          servings={formData.servings || 4}
          className="mb-8"
        />
      )}

      {/* Tags and Dietary Restrictions */}
      {(formData.tags && formData.tags.length > 0) ||
        (formData.dietaryRestrictions &&
          formData.dietaryRestrictions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags & Dietary Information</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.dietaryRestrictions &&
                  formData.dietaryRestrictions.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-700">
                        Dietary Restrictions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.dietaryRestrictions.map(
                          (restriction, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="border-green-200 bg-green-50 text-green-700"
                            >
                              {restriction}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}

      {/* Preview Footer */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-center text-sm text-gray-600">
          End of recipe preview. Switch back to edit mode to continue making
          changes.
        </p>
      </div>
    </div>
  );
}

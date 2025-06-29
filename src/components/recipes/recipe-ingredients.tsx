'use client';

import { useState, useMemo } from 'react';
import {
  Check,
  Plus,
  Minus,
  ShoppingCart,
  Copy,
  Download,
  Users,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  category?: string;
}

interface RecipeIngredientsProps {
  ingredients: Ingredient[];
  originalServings: number;
  className?: string;
}

// Measurement conversion functions
const measurementConversions: Record<
  string,
  { metric: string; imperial: string; factor: number }
> = {
  // Volume conversions
  cups: { metric: 'ml', imperial: 'cups', factor: 240 },
  cup: { metric: 'ml', imperial: 'cup', factor: 240 },
  tablespoons: { metric: 'ml', imperial: 'tablespoons', factor: 15 },
  tablespoon: { metric: 'ml', imperial: 'tablespoon', factor: 15 },
  tbsp: { metric: 'ml', imperial: 'tbsp', factor: 15 },
  teaspoons: { metric: 'ml', imperial: 'teaspoons', factor: 5 },
  teaspoon: { metric: 'ml', imperial: 'teaspoon', factor: 5 },
  tsp: { metric: 'ml', imperial: 'tsp', factor: 5 },
  'fluid ounces': { metric: 'ml', imperial: 'fluid ounces', factor: 30 },
  'fl oz': { metric: 'ml', imperial: 'fl oz', factor: 30 },
  pints: { metric: 'ml', imperial: 'pints', factor: 480 },
  pint: { metric: 'ml', imperial: 'pint', factor: 480 },
  quarts: { metric: 'L', imperial: 'quarts', factor: 0.95 },
  quart: { metric: 'L', imperial: 'quart', factor: 0.95 },

  // Weight conversions
  pounds: { metric: 'g', imperial: 'pounds', factor: 454 },
  pound: { metric: 'g', imperial: 'pound', factor: 454 },
  lbs: { metric: 'g', imperial: 'lbs', factor: 454 },
  lb: { metric: 'g', imperial: 'lb', factor: 454 },
  ounces: { metric: 'g', imperial: 'ounces', factor: 28 },
  ounce: { metric: 'g', imperial: 'ounce', factor: 28 },
  oz: { metric: 'g', imperial: 'oz', factor: 28 },

  // Temperature (handled separately)
  fahrenheit: { metric: 'celsius', imperial: 'fahrenheit', factor: 1 },
  f: { metric: 'c', imperial: 'f', factor: 1 },
};

function convertMeasurement(
  quantity: string,
  unit: string,
  toMetric: boolean
): { quantity: string; unit: string } {
  const conversion = measurementConversions[unit.toLowerCase()];
  if (!conversion) {
    return { quantity, unit };
  }

  // Parse quantity
  const numMatch = quantity.match(/(\d+\.?\d*)/);
  if (!numMatch) {
    return { quantity, unit };
  }

  const num = parseFloat(numMatch[1]);

  if (toMetric) {
    // Convert to metric
    let convertedValue = num * conversion.factor;
    let targetUnit = conversion.metric;

    // Smart unit selection for metric
    if (targetUnit === 'ml' && convertedValue >= 1000) {
      convertedValue = convertedValue / 1000;
      targetUnit = 'L';
    } else if (targetUnit === 'g' && convertedValue >= 1000) {
      convertedValue = convertedValue / 1000;
      targetUnit = 'kg';
    }

    // Format the number
    const formattedValue =
      convertedValue % 1 === 0
        ? convertedValue.toString()
        : convertedValue < 10
          ? convertedValue.toFixed(1)
          : Math.round(convertedValue).toString();

    return {
      quantity: formattedValue,
      unit: targetUnit,
    };
  } else {
    // Convert back to imperial (if it was converted)
    return { quantity, unit: conversion.imperial };
  }
}

// Helper function to parse and scale quantities
function scaleQuantity(quantity: string, scale: number): string {
  // Handle fractions and mixed numbers
  const fractionMatch = quantity.match(/(\d+)?\s*(\d+)\/(\d+)/);
  if (fractionMatch) {
    const whole = parseInt(fractionMatch[1] || '0');
    const num = parseInt(fractionMatch[2]);
    const den = parseInt(fractionMatch[3]);
    const decimal = whole + num / den;
    const scaled = decimal * scale;

    // Convert back to fraction if it makes sense
    if (scaled % 1 === 0) {
      return scaled.toString();
    } else if (scaled < 1) {
      // Convert to fraction
      const gcd = (a: number, b: number): number =>
        b === 0 ? a : gcd(b, a % b);
      const denominator = 8; // Common cooking fractions
      const numerator = Math.round(scaled * denominator);
      const commonFactor = gcd(numerator, denominator);
      return `${numerator / commonFactor}/${denominator / commonFactor}`;
    } else {
      // Mixed number
      const wholeScaled = Math.floor(scaled);
      const fraction = scaled - wholeScaled;
      if (fraction < 0.125) {
        return wholeScaled.toString();
      } else if (fraction < 0.375) {
        return `${wholeScaled} 1/4`;
      } else if (fraction < 0.625) {
        return `${wholeScaled} 1/2`;
      } else if (fraction < 0.875) {
        return `${wholeScaled} 3/4`;
      } else {
        return (wholeScaled + 1).toString();
      }
    }
  }

  // Handle decimal numbers
  const numMatch = quantity.match(/(\d+\.?\d*)/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    const scaled = num * scale;

    // Round to reasonable precision
    if (scaled % 1 === 0) {
      return scaled.toString();
    } else if (scaled < 10) {
      return scaled.toFixed(2).replace(/\.?0+$/, '');
    } else {
      return Math.round(scaled).toString();
    }
  }

  // Return original if no number found
  return quantity;
}

export function RecipeIngredients({
  ingredients,
  originalServings,
  className = '',
}: RecipeIngredientsProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set()
  );
  const [currentServings, setCurrentServings] = useState(originalServings);
  const [useMetric, setUseMetric] = useState(false);

  const servingsScale = currentServings / originalServings;

  // Group ingredients by category
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {};

    ingredients.forEach((ingredient) => {
      const category = ingredient.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(ingredient);
    });

    return groups;
  }, [ingredients]);

  const scaledIngredients = useMemo(() => {
    return ingredients.map((ingredient) => {
      const scaledQuantity = scaleQuantity(ingredient.quantity, servingsScale);
      const converted = convertMeasurement(
        scaledQuantity,
        ingredient.unit,
        useMetric
      );
      return {
        ...ingredient,
        quantity: converted.quantity,
        unit: converted.unit,
      };
    });
  }, [ingredients, servingsScale, useMetric]);

  const toggleIngredient = (id: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIngredients(newChecked);
  };

  const adjustServings = (change: number) => {
    const newServings = Math.max(1, currentServings + change);
    setCurrentServings(newServings);
  };

  const resetServings = () => {
    setCurrentServings(originalServings);
  };

  const exportToClipboard = async () => {
    const shoppingList = scaledIngredients
      .map((ingredient) => {
        const notes = ingredient.notes ? ` (${ingredient.notes})` : '';
        return `• ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}${notes}`;
      })
      .join('\n');

    const text = `Shopping List - ${currentServings} servings:\n\n${shoppingList}`;

    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Shopping list copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const exportToPDF = () => {
    // Create a simple text file for download
    const shoppingList = scaledIngredients
      .map((ingredient) => {
        const notes = ingredient.notes ? ` (${ingredient.notes})` : '';
        return `• ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}${notes}`;
      })
      .join('\n');

    const text = `Shopping List - ${currentServings} servings:\n\n${shoppingList}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shopping-list.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const IngredientItem = ({ ingredient }: { ingredient: Ingredient }) => {
    const isChecked = checkedIngredients.has(ingredient.id);
    const scaledQuantity = scaleQuantity(ingredient.quantity, servingsScale);

    return (
      <div
        className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-gray-50 ${
          isChecked ? 'bg-green-50 opacity-75' : ''
        }`}
        onClick={() => toggleIngredient(ingredient.id)}
      >
        <div
          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
            isChecked
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {isChecked && <Check className="h-3 w-3" />}
        </div>

        <div className="flex-1">
          <div
            className={`text-gray-900 ${isChecked ? 'text-gray-500 line-through' : ''}`}
          >
            <span className="font-medium">
              {scaledQuantity} {ingredient.unit}
            </span>{' '}
            <span>{ingredient.name}</span>
          </div>
          {ingredient.notes && (
            <div className="mt-1 text-sm text-gray-500">{ingredient.notes}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Ingredients</CardTitle>

          {/* Servings Adjuster */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">Servings:</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustServings(-1)}
                disabled={currentServings <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <span className="min-w-[3ch] text-center text-lg font-medium">
                {currentServings}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustServings(1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {currentServings !== originalServings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetServings}
                className="text-blue-600 hover:text-blue-700"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Measurement Toggle and Export Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          {/* Measurement Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Units:</span>
            <button
              onClick={() => setUseMetric(!useMetric)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
            >
              {useMetric ? (
                <ToggleRight className="h-4 w-4 text-blue-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
              <span className={useMetric ? 'text-blue-600' : 'text-gray-600'}>
                {useMetric ? 'Metric' : 'Imperial'}
              </span>
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              Copy List
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Progress Indicator */}
        {checkedIngredients.size > 0 && (
          <div className="mb-6 rounded-lg bg-green-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-green-700">
                Progress: {checkedIngredients.size} of {ingredients.length}{' '}
                ingredients
              </span>
              <span className="text-green-600">
                {Math.round(
                  (checkedIngredients.size / ingredients.length) * 100
                )}
                % complete
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-green-200">
              <div
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${(checkedIngredients.size / ingredients.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Ingredients List */}
        {Object.keys(groupedIngredients).length > 1 ? (
          // Grouped by category
          <div className="space-y-6">
            {Object.entries(groupedIngredients).map(
              ([category, categoryIngredients]) => (
                <div key={category}>
                  <h3 className="mb-3 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryIngredients.map((ingredient) => (
                      <IngredientItem
                        key={ingredient.id}
                        ingredient={ingredient}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          // Simple list
          <div className="space-y-2">
            {scaledIngredients.map((ingredient) => (
              <IngredientItem key={ingredient.id} ingredient={ingredient} />
            ))}
          </div>
        )}

        {/* Helper Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Click ingredients to check them off as you cook
        </div>
      </CardContent>
    </Card>
  );
}

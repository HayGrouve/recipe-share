'use client';

import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Search } from 'lucide-react';
import { UNITS } from '@/lib/validations/recipe';
import { cn } from '@/lib/utils';
import type { RecipeFormData } from '@/lib/validations/recipe';

// Ingredient categories for organization
const INGREDIENT_CATEGORIES = [
  'Proteins',
  'Vegetables',
  'Fruits',
  'Grains',
  'Dairy',
  'Spices & Herbs',
  'Condiments',
  'Baking',
  'Oils & Vinegars',
  'Nuts & Seeds',
  'Other',
] as const;

// Common ingredients for autocomplete (in a real app, this would come from a database)
const COMMON_INGREDIENTS = [
  'Chicken breast',
  'Ground beef',
  'Salmon fillet',
  'Eggs',
  'Milk',
  'Butter',
  'Olive oil',
  'Salt',
  'Black pepper',
  'Garlic',
  'Onion',
  'Tomatoes',
  'Potatoes',
  'Carrots',
  'Bell peppers',
  'Spinach',
  'Broccoli',
  'Mushrooms',
  'Rice',
  'Pasta',
  'Bread',
  'Flour',
  'Sugar',
  'Baking powder',
  'Vanilla extract',
  'Lemon',
  'Lime',
  'Basil',
  'Oregano',
  'Thyme',
  'Paprika',
  'Cumin',
  'Cheese',
  'Yogurt',
  'Cream',
  'Soy sauce',
  'Honey',
  'Vinegar',
] as const;

interface IngredientAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function IngredientAutocomplete({
  value,
  onChange,
  placeholder,
}: IngredientAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredIngredients, setFilteredIngredients] = useState<string[]>([]);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);

    if (inputValue.length > 0) {
      const filtered = COMMON_INGREDIENTS.filter((ingredient) =>
        ingredient.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 8); // Limit to 8 suggestions
      setFilteredIngredients(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setIsOpen(false);
    }
  };

  const selectIngredient = (ingredient: string) => {
    onChange(ingredient);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder || 'Start typing ingredient name...'}
          className="pr-8"
          onFocus={() => {
            if (value.length > 0 && filteredIngredients.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            // Delay closing to allow selection
            setTimeout(() => setIsOpen(false), 150);
          }}
        />
        <Search className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
      </div>

      {isOpen && filteredIngredients.length > 0 && (
        <Card className="absolute top-full right-0 left-0 z-10 mt-1 max-h-48 overflow-y-auto">
          <CardContent className="p-2">
            {filteredIngredients.map((ingredient, index) => (
              <button
                key={index}
                type="button"
                className="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                onClick={() => selectIngredient(ingredient)}
              >
                {ingredient}
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function IngredientsStep() {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<RecipeFormData>();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const watchedIngredients = watch('ingredients');

  const addIngredient = () => {
    append({
      id: Date.now().toString(),
      quantity: '',
      unit: '',
      name: '',
      notes: '',
      category: '',
    });
  };

  const removeIngredient = (index: number) => {
    if (fields.length > 1) {
      // Keep at least one ingredient
      remove(index);
    }
  };

  const moveIngredient = (fromIndex: number, toIndex: number) => {
    if (toIndex >= 0 && toIndex < fields.length) {
      move(fromIndex, toIndex);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== toIndex) {
      moveIngredient(fromIndex, toIndex);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Recipe Ingredients
        </h3>
        <p className="text-sm text-gray-600">
          Add all ingredients needed for your recipe. You can drag and drop to
          reorder ingredients.
        </p>
      </div>

      {/* Ingredients List */}
      <div className="space-y-4">
        {fields.map((field, index) => {
          const ingredientErrors = errors.ingredients?.[index];

          return (
            <Card
              key={field.id}
              className={cn(
                'transition-colors',
                ingredientErrors
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200'
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div className="flex items-center pt-2">
                    <GripVertical className="h-4 w-4 cursor-grab text-gray-400 active:cursor-grabbing" />
                  </div>

                  {/* Ingredient Fields */}
                  <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-12">
                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <Label
                        htmlFor={`ingredients.${index}.quantity`}
                        className="text-xs text-gray-600"
                      >
                        Quantity*
                      </Label>
                      <Input
                        {...register(`ingredients.${index}.quantity`)}
                        placeholder="1"
                        className={cn(
                          'mt-1',
                          ingredientErrors?.quantity && 'border-red-300'
                        )}
                      />
                      {ingredientErrors?.quantity && (
                        <p className="mt-1 text-xs text-red-600">
                          {ingredientErrors.quantity.message}
                        </p>
                      )}
                    </div>

                    {/* Unit */}
                    <div className="md:col-span-2">
                      <Label
                        htmlFor={`ingredients.${index}.unit`}
                        className="text-xs text-gray-600"
                      >
                        Unit*
                      </Label>
                      <Select
                        value={watchedIngredients?.[index]?.unit || ''}
                        onValueChange={(value) =>
                          setValue(`ingredients.${index}.unit`, value)
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            'mt-1',
                            ingredientErrors?.unit && 'border-red-300'
                          )}
                        >
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="max-h-48 overflow-y-auto">
                            {/* Volume */}
                            <div className="bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">
                              Volume
                            </div>
                            {UNITS.filter((unit) =>
                              [
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
                              ].includes(unit)
                            ).map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}

                            {/* Weight */}
                            <div className="bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">
                              Weight
                            </div>
                            {UNITS.filter((unit) =>
                              [
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
                              ].includes(unit)
                            ).map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}

                            {/* Count */}
                            <div className="bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">
                              Count
                            </div>
                            {UNITS.filter((unit) =>
                              [
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
                              ].includes(unit)
                            ).map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}

                            {/* Other */}
                            <div className="bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">
                              Other
                            </div>
                            {UNITS.filter((unit) =>
                              [
                                'pinch',
                                'dash',
                                'handful',
                                'to taste',
                                'as needed',
                              ].includes(unit)
                            ).map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                      {ingredientErrors?.unit && (
                        <p className="mt-1 text-xs text-red-600">
                          {ingredientErrors.unit.message}
                        </p>
                      )}
                    </div>

                    {/* Ingredient Name */}
                    <div className="md:col-span-4">
                      <Label
                        htmlFor={`ingredients.${index}.name`}
                        className="text-xs text-gray-600"
                      >
                        Ingredient*
                      </Label>
                      <div className="mt-1">
                        <IngredientAutocomplete
                          value={watchedIngredients?.[index]?.name || ''}
                          onChange={(value) =>
                            setValue(`ingredients.${index}.name`, value)
                          }
                          placeholder="e.g., Chicken breast"
                        />
                      </div>
                      {ingredientErrors?.name && (
                        <p className="mt-1 text-xs text-red-600">
                          {ingredientErrors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Category */}
                    <div className="md:col-span-2">
                      <Label
                        htmlFor={`ingredients.${index}.category`}
                        className="text-xs text-gray-600"
                      >
                        Category
                      </Label>
                      <Select
                        value={watchedIngredients?.[index]?.category || ''}
                        onValueChange={(value) =>
                          setValue(`ingredients.${index}.category`, value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          {INGREDIENT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <Label
                        htmlFor={`ingredients.${index}.notes`}
                        className="text-xs text-gray-600"
                      >
                        Notes
                      </Label>
                      <Textarea
                        {...register(`ingredients.${index}.notes`)}
                        placeholder="Optional notes..."
                        className="mt-1 min-h-[38px] resize-none"
                        rows={1}
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="flex items-center pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      disabled={fields.length === 1}
                      className="p-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Ingredient Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={addIngredient}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Another Ingredient
        </Button>
      </div>

      {/* Ingredients Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-blue-800">
              Total Ingredients: {fields.length}
            </span>
            <span className="text-blue-600">
              {fields.length >= 3
                ? '✓ Good variety'
                : 'Consider adding more ingredients'}
            </span>
          </div>
          {fields.length > 10 && (
            <p className="mt-1 text-xs text-blue-600">
              Tip: For very long ingredient lists, consider grouping by category
              or creating multiple recipes.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

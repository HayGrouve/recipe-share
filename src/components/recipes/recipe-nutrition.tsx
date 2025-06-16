'use client';

import { useState } from 'react';
import {
  Activity,
  Zap,
  Droplets,
  Wheat,
  Apple,
  Info,
  ChevronDown,
  ChevronUp,
  Calculator,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface NutritionInfo {
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

interface RecipeNutritionProps {
  nutrition: NutritionInfo;
  servings: number;
  className?: string;
}

interface MacroNutrient {
  name: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
  dailyValue?: number;
}

export function RecipeNutrition({
  nutrition,
  servings,
  className = '',
}: RecipeNutritionProps) {
  const [showDetailed, setShowDetailed] = useState(false);
  const [currentServings, setCurrentServings] = useState(servings);

  const perServing = {
    calories: Math.round((nutrition.calories / servings) * currentServings),
    protein:
      Math.round((nutrition.protein / servings) * currentServings * 10) / 10,
    carbs: Math.round((nutrition.carbs / servings) * currentServings * 10) / 10,
    fat: Math.round((nutrition.fat / servings) * currentServings * 10) / 10,
    fiber: Math.round((nutrition.fiber / servings) * currentServings * 10) / 10,
    sugar: Math.round((nutrition.sugar / servings) * currentServings * 10) / 10,
    sodium: Math.round((nutrition.sodium / servings) * currentServings),
    cholesterol: Math.round(
      (nutrition.cholesterol / servings) * currentServings
    ),
    saturatedFat:
      Math.round((nutrition.saturatedFat / servings) * currentServings * 10) /
      10,
    transFat:
      Math.round((nutrition.transFat / servings) * currentServings * 10) / 10,
    vitaminA: nutrition.vitaminA
      ? Math.round((nutrition.vitaminA / servings) * currentServings)
      : undefined,
    vitaminC: nutrition.vitaminC
      ? Math.round((nutrition.vitaminC / servings) * currentServings)
      : undefined,
    calcium: nutrition.calcium
      ? Math.round((nutrition.calcium / servings) * currentServings)
      : undefined,
    iron: nutrition.iron
      ? Math.round((nutrition.iron / servings) * currentServings)
      : undefined,
  };

  const macros: MacroNutrient[] = [
    {
      name: 'Protein',
      value: perServing.protein,
      unit: 'g',
      color: 'bg-blue-500',
      icon: <Activity className="h-4 w-4" />,
      dailyValue: Math.round((perServing.protein / 50) * 100),
    },
    {
      name: 'Carbs',
      value: perServing.carbs,
      unit: 'g',
      color: 'bg-green-500',
      icon: <Wheat className="h-4 w-4" />,
      dailyValue: Math.round((perServing.carbs / 300) * 100),
    },
    {
      name: 'Fat',
      value: perServing.fat,
      unit: 'g',
      color: 'bg-yellow-500',
      icon: <Droplets className="h-4 w-4" />,
      dailyValue: Math.round((perServing.fat / 65) * 100),
    },
  ];

  const totalMacroCalories =
    perServing.protein * 4 + perServing.carbs * 4 + perServing.fat * 9;

  const macroPercentages = {
    protein: Math.round(((perServing.protein * 4) / totalMacroCalories) * 100),
    carbs: Math.round(((perServing.carbs * 4) / totalMacroCalories) * 100),
    fat: Math.round(((perServing.fat * 9) / totalMacroCalories) * 100),
  };

  const adjustServings = (newServings: number) => {
    if (newServings > 0 && newServings <= 20) {
      setCurrentServings(newServings);
    }
  };

  const getNutritionGrade = (
    calories: number,
    fiber: number,
    sugar: number,
    sodium: number
  ) => {
    let score = 0;

    if (fiber >= 5) score += 2;
    else if (fiber >= 3) score += 1;

    if (sugar >= 15) score -= 2;
    else if (sugar >= 10) score -= 1;

    if (sodium >= 800) score -= 2;
    else if (sodium >= 500) score -= 1;

    if (calories <= 300) score += 1;
    else if (calories >= 600) score -= 1;

    if (score >= 2)
      return {
        grade: 'A',
        color: 'text-green-600 bg-green-50 border-green-200',
        description: 'Excellent nutritional profile',
      };
    if (score >= 0)
      return {
        grade: 'B',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        description: 'Good nutritional balance',
      };
    if (score >= -2)
      return {
        grade: 'C',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        description: 'Fair nutritional value',
      };
    return {
      grade: 'D',
      color: 'text-red-600 bg-red-50 border-red-200',
      description: 'Consider healthier alternatives',
    };
  };

  const nutritionGrade = getNutritionGrade(
    perServing.calories,
    perServing.fiber,
    perServing.sugar,
    perServing.sodium
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Apple className="h-6 w-6 text-green-600" />
            Nutrition Facts
          </CardTitle>

          <Badge
            variant="outline"
            className={`px-3 py-1 text-lg font-bold ${nutritionGrade.color}`}
          >
            Grade {nutritionGrade.grade}
          </Badge>
        </div>

        <p className="text-sm text-gray-600">{nutritionGrade.description}</p>

        <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Nutrition for:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustServings(currentServings - 1)}
              disabled={currentServings <= 1}
              className="h-8 w-8 p-0"
            >
              -
            </Button>

            <span className="min-w-[3rem] text-center text-lg font-bold">
              {currentServings}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustServings(currentServings + 1)}
              disabled={currentServings >= 20}
              className="h-8 w-8 p-0"
            >
              +
            </Button>

            <span className="text-sm text-gray-600">
              serving{currentServings !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-orange-600" />
            <span className="text-lg font-semibold text-gray-700">
              Calories per serving
            </span>
          </div>
          <div className="text-4xl font-bold text-orange-600">
            {perServing.calories}
          </div>
          <div className="mt-1 text-sm text-gray-600">
            {Math.round((perServing.calories / 2000) * 100)}% of daily value*
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Macronutrient Breakdown
          </h3>

          <div className="mb-4 flex h-4 overflow-hidden rounded-full bg-gray-200">
            <div
              className="bg-blue-500 transition-all duration-300"
              style={{ width: `${macroPercentages.protein}%` }}
              title={`Protein: ${macroPercentages.protein}%`}
            />
            <div
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${macroPercentages.carbs}%` }}
              title={`Carbs: ${macroPercentages.carbs}%`}
            />
            <div
              className="bg-yellow-500 transition-all duration-300"
              style={{ width: `${macroPercentages.fat}%` }}
              title={`Fat: ${macroPercentages.fat}%`}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {macros.map((macro) => (
              <div
                key={macro.name}
                className="rounded-lg bg-gray-50 p-4 text-center"
              >
                <div className="mb-2 flex items-center justify-center gap-1">
                  {macro.icon}
                  <span className="font-medium text-gray-700">
                    {macro.name}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {macro.value}
                  {macro.unit}
                </div>
                <div className="text-sm text-gray-600">
                  {
                    macroPercentages[
                      macro.name.toLowerCase() as keyof typeof macroPercentages
                    ]
                  }
                  % of calories
                </div>
                {macro.dailyValue && (
                  <div className="mt-1 text-xs text-gray-500">
                    {macro.dailyValue}% DV
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Key Nutrients
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="font-medium text-gray-700">Fiber</span>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {perServing.fiber}g
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round((perServing.fiber / 25) * 100)}% DV
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="font-medium text-gray-700">Sugar</span>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {perServing.sugar}g
                </div>
                <div className="text-xs text-gray-500">Natural + Added</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="font-medium text-gray-700">Sodium</span>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {perServing.sodium}mg
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round((perServing.sodium / 2300) * 100)}% DV
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="font-medium text-gray-700">Cholesterol</span>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {perServing.cholesterol}mg
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round((perServing.cholesterol / 300) * 100)}% DV
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setShowDetailed(!showDetailed)}
            className="flex w-full items-center justify-center gap-2"
          >
            <Info className="h-4 w-4" />
            {showDetailed ? 'Hide' : 'Show'} Detailed Nutrition
            {showDetailed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {showDetailed && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Detailed Nutrition Information
            </h3>

            <div className="mb-6">
              <h4 className="mb-3 font-medium text-gray-700">Fat Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Saturated Fat</span>
                  <div className="text-right">
                    <span className="font-medium">
                      {perServing.saturatedFat}g
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {Math.round((perServing.saturatedFat / 20) * 100)}% DV
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trans Fat</span>
                  <span className="font-medium">{perServing.transFat}g</span>
                </div>
              </div>
            </div>

            {(perServing.vitaminA ||
              perServing.vitaminC ||
              perServing.calcium ||
              perServing.iron) && (
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-gray-700">
                  Vitamins & Minerals
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {perServing.vitaminA && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Vitamin A</span>
                      <span className="font-medium">
                        {perServing.vitaminA}% DV
                      </span>
                    </div>
                  )}
                  {perServing.vitaminC && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Vitamin C</span>
                      <span className="font-medium">
                        {perServing.vitaminC}% DV
                      </span>
                    </div>
                  )}
                  {perServing.calcium && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Calcium</span>
                      <span className="font-medium">
                        {perServing.calcium}% DV
                      </span>
                    </div>
                  )}
                  {perServing.iron && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Iron</span>
                      <span className="font-medium">{perServing.iron}% DV</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h4 className="mb-3 font-medium text-gray-700">
                Daily Value Progress
              </h4>
              <div className="space-y-3">
                {[
                  {
                    name: 'Protein',
                    value: Math.round((perServing.protein / 50) * 100),
                    color: 'bg-blue-500',
                  },
                  {
                    name: 'Fiber',
                    value: Math.round((perServing.fiber / 25) * 100),
                    color: 'bg-green-500',
                  },
                  {
                    name: 'Sodium',
                    value: Math.round((perServing.sodium / 2300) * 100),
                    color: 'bg-red-500',
                  },
                ].map((nutrient) => (
                  <div key={nutrient.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-600">{nutrient.name}</span>
                      <span className="font-medium">{nutrient.value}% DV</span>
                    </div>
                    <Progress
                      value={Math.min(nutrient.value, 100)}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
          <p>* Percent Daily Values are based on a 2,000 calorie diet.</p>
          <p className="mt-1">
            Nutrition information is estimated and may vary based on ingredients
            and preparation methods.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

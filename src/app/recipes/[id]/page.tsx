import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  Users,
  ChefHat,
  Heart,
  Share2,
  Bookmark,
  Star,
  ArrowLeft,
  Timer,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecipeIngredients } from '@/components/recipes/recipe-ingredients';
import { RecipeInstructions } from '@/components/recipes/recipe-instructions';
import { RecipeNutrition } from '@/components/recipes/recipe-nutrition';

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prepTime: number | null;
  cookTime: number | null;
  totalTime: number | null;
  servings: number | null;
  difficulty: string | null;
  cuisine: string | null;
  category: string | null;
  imageUrl: string | null;
  instructions: string;
  isPublic: boolean;
  isDraft: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    profileImageUrl: string | null;
  } | null;
}

async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/recipes/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.recipe;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
}

function formatTime(minutes: number | null): string {
  if (!minutes) return 'N/A';

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function getDifficultyColor(difficulty: string | null): string {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  const authorDisplayName =
    recipe.author?.username ||
    (recipe.author?.firstName && recipe.author?.lastName
      ? `${recipe.author.firstName} ${recipe.author.lastName}`
      : recipe.author?.firstName ||
        recipe.author?.lastName ||
        'Anonymous Chef');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/recipes"
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Recipes</span>
            </Link>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Recipe Header */}
        <div className="mb-8">
          {/* Title and Author */}
          <div className="mb-6">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              {recipe.title}
            </h1>

            {/* Author Info */}
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-3">
                {recipe.author?.profileImageUrl ? (
                  <Image
                    src={recipe.author.profileImageUrl}
                    alt={authorDisplayName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                    <ChefHat className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {authorDisplayName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(recipe.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Recipe Status Badges */}
              <div className="ml-auto flex items-center gap-2">
                {recipe.isPublic && (
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    <Globe className="mr-1 h-3 w-3" />
                    Public
                  </Badge>
                )}
                {recipe.isDraft && (
                  <Badge
                    variant="outline"
                    className="border-yellow-200 bg-yellow-50 text-yellow-700"
                  >
                    Draft
                  </Badge>
                )}
              </div>
            </div>

            {/* Recipe Description */}
            {recipe.description && (
              <p className="text-lg leading-relaxed text-gray-700">
                {recipe.description}
              </p>
            )}
          </div>

          {/* Hero Image */}
          {recipe.imageUrl && (
            <div className="relative mb-8 h-96 w-full overflow-hidden rounded-xl shadow-lg">
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 768px, 1024px"
              />
            </div>
          )}

          {/* Quick Info Bar */}
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
                    {formatTime(recipe.prepTime)}
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
                    {formatTime(recipe.cookTime)}
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
                    {recipe.servings || 'N/A'}
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
                    className={getDifficultyColor(recipe.difficulty)}
                  >
                    {recipe.difficulty || 'Not specified'}
                  </Badge>
                </div>
              </div>

              {/* Additional Info Row */}
              {(recipe.cuisine || recipe.category || recipe.totalTime) && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex flex-wrap justify-center gap-4">
                    {recipe.totalTime && (
                      <div className="text-center">
                        <span className="text-sm text-gray-500">
                          Total Time:
                        </span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formatTime(recipe.totalTime)}
                        </span>
                      </div>
                    )}
                    {recipe.cuisine && (
                      <div className="text-center">
                        <span className="text-sm text-gray-500">Cuisine:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {recipe.cuisine}
                        </span>
                      </div>
                    )}
                    {recipe.category && (
                      <div className="text-center">
                        <span className="text-sm text-gray-500">Category:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {recipe.category}
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
        <RecipeIngredients
          ingredients={[
            {
              id: '1',
              name: 'All-purpose flour',
              quantity: '2',
              unit: 'cups',
              category: 'Baking',
            },
            {
              id: '2',
              name: 'Large eggs',
              quantity: '3',
              unit: 'pieces',
              category: 'Dairy & Eggs',
            },
            {
              id: '3',
              name: 'Whole milk',
              quantity: '1',
              unit: 'cup',
              category: 'Dairy & Eggs',
            },
            {
              id: '4',
              name: 'Unsalted butter',
              quantity: '2',
              unit: 'tablespoons',
              notes: 'melted',
              category: 'Dairy & Eggs',
            },
            {
              id: '5',
              name: 'Salt',
              quantity: '1/2',
              unit: 'teaspoon',
              category: 'Seasonings',
            },
            {
              id: '6',
              name: 'Baking powder',
              quantity: '2',
              unit: 'teaspoons',
              category: 'Baking',
            },
            {
              id: '7',
              name: 'Sugar',
              quantity: '1',
              unit: 'tablespoon',
              notes: 'optional',
              category: 'Baking',
            },
          ]}
          originalServings={recipe.servings || 4}
          className="mb-8"
        />

        {/* Instructions Section */}
        <RecipeInstructions
          instructions={[
            {
              id: 'step-1',
              stepNumber: 1,
              instruction:
                'In a large mixing bowl, whisk together flour, baking powder, salt, and sugar (if using).',
              tips: 'Make sure to sift the flour for lighter pancakes.',
            },
            {
              id: 'step-2',
              stepNumber: 2,
              instruction:
                'In another bowl, beat the eggs and then whisk in the milk and melted butter.',
              temperature: '350°F oven',
            },
            {
              id: 'step-3',
              stepNumber: 3,
              instruction:
                'Pour the wet ingredients into the dry ingredients and stir until just combined. Do not overmix - a few lumps are okay.',
              tips: 'Overmixing will result in tough, dense pancakes. The batter should be slightly lumpy.',
            },
            {
              id: 'step-4',
              stepNumber: 4,
              instruction:
                'Heat a non-stick pan or griddle over medium heat. Lightly grease with butter or oil.',
              timerMinutes: 2,
            },
            {
              id: 'step-5',
              stepNumber: 5,
              instruction:
                'Pour 1/4 cup of batter for each pancake onto the hot griddle. Cook until bubbles form on the surface and edges look set, about 2-3 minutes.',
              timerMinutes: 3,
              tips: 'Wait for bubbles to form and pop before flipping - this ensures the pancake is ready.',
            },
            {
              id: 'step-6',
              stepNumber: 6,
              instruction:
                'Flip carefully with a spatula and cook for another 1-2 minutes until golden brown on the bottom.',
              timerMinutes: 2,
            },
            {
              id: 'step-7',
              stepNumber: 7,
              instruction:
                'Transfer to a warm plate and repeat with remaining batter. Serve immediately with your favorite toppings.',
              tips: 'Keep finished pancakes warm in a 200°F oven while cooking the rest.',
            },
          ]}
          className="mb-8"
        />

        {/* Nutrition Section */}
        <RecipeNutrition
          nutrition={{
            calories: 320,
            protein: 12.5,
            carbs: 45.2,
            fat: 8.3,
            fiber: 3.1,
            sugar: 8.7,
            sodium: 420,
            cholesterol: 95,
            saturatedFat: 3.2,
            transFat: 0.1,
            vitaminA: 15,
            vitaminC: 8,
            calcium: 25,
            iron: 12,
          }}
          servings={recipe.servings || 4}
          className="mb-8"
        />

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Heart className="mr-2 h-5 w-5" />
            Add to Favorites
          </Button>
          <Button variant="outline" size="lg">
            <Star className="mr-2 h-5 w-5" />
            Rate Recipe
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="mr-2 h-5 w-5" />
            Share Recipe
          </Button>
        </div>
      </div>
    </div>
  );
}

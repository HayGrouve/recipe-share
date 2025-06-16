'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  ChefHat,
  Star,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Types
interface RelatedRecipe {
  id: string;
  title: string;
  description: string;
  image: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  stats: {
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    rating: number;
    reviewCount: number;
    viewCount: number;
    favoriteCount: number;
  };
  tags: string[];
  category: string;
  isPublic: boolean;
  createdAt: string;
}

interface Recipe {
  id: string;
  title: string;
  tags: string[];
  category: string;
  author: {
    id: string;
    name: string;
  };
}

interface RecipeRelatedProps {
  currentRecipe: Recipe;
  limit?: number;
  className?: string;
}

// Mock related recipes data
const mockRelatedRecipes: RelatedRecipe[] = [
  {
    id: '2',
    title: 'Blueberry Pancakes',
    description:
      'Fluffy pancakes bursting with fresh blueberries and served with maple syrup.',
    image: '/images/recipes/blueberry-pancakes.jpg',
    author: {
      id: 'user2',
      name: 'Sarah Johnson',
      avatar: '/images/avatars/sarah.jpg',
    },
    stats: {
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      rating: 4.7,
      reviewCount: 89,
      viewCount: 2340,
      favoriteCount: 156,
    },
    tags: ['breakfast', 'pancakes', 'berries', 'sweet'],
    category: 'Breakfast',
    isPublic: true,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '3',
    title: 'French Toast Casserole',
    description:
      'Make-ahead breakfast casserole perfect for weekend mornings or holidays.',
    image: '/images/recipes/french-toast-casserole.jpg',
    author: {
      id: 'user3',
      name: 'Mike Chen',
      avatar: '/images/avatars/mike.jpg',
    },
    stats: {
      prepTime: 20,
      cookTime: 45,
      servings: 8,
      difficulty: 'Medium',
      rating: 4.9,
      reviewCount: 124,
      viewCount: 3450,
      favoriteCount: 287,
    },
    tags: ['breakfast', 'casserole', 'make-ahead', 'sweet'],
    category: 'Breakfast',
    isPublic: true,
    createdAt: '2024-01-10T08:15:00Z',
  },
  {
    id: '4',
    title: 'Avocado Toast Supreme',
    description:
      'Elevated avocado toast with poached egg, microgreens, and everything seasoning.',
    image: '/images/recipes/avocado-toast.jpg',
    author: {
      id: 'user4',
      name: 'Emma Wilson',
      avatar: '/images/avatars/emma.jpg',
    },
    stats: {
      prepTime: 15,
      cookTime: 5,
      servings: 2,
      difficulty: 'Easy',
      rating: 4.5,
      reviewCount: 67,
      viewCount: 1890,
      favoriteCount: 98,
    },
    tags: ['breakfast', 'healthy', 'avocado', 'eggs'],
    category: 'Breakfast',
    isPublic: true,
    createdAt: '2024-01-20T07:45:00Z',
  },
  {
    id: '5',
    title: 'Chocolate Chip Waffles',
    description:
      'Crispy waffles loaded with chocolate chips, perfect for weekend brunches.',
    image: '/images/recipes/chocolate-waffles.jpg',
    author: {
      id: 'user5',
      name: 'Alex Rodriguez',
      avatar: '/images/avatars/alex.jpg',
    },
    stats: {
      prepTime: 15,
      cookTime: 20,
      servings: 6,
      difficulty: 'Easy',
      rating: 4.6,
      reviewCount: 203,
      viewCount: 4120,
      favoriteCount: 245,
    },
    tags: ['breakfast', 'waffles', 'chocolate', 'sweet'],
    category: 'Breakfast',
    isPublic: true,
    createdAt: '2024-01-05T09:20:00Z',
  },
];

// Calculate relevance score for related recipes
function calculateRelevanceScore(
  currentRecipe: Recipe,
  candidateRecipe: RelatedRecipe
): number {
  let score = 0;

  // Same category gets high score
  if (currentRecipe.category === candidateRecipe.category) {
    score += 40;
  }

  // Tag matching
  const commonTags = currentRecipe.tags.filter((tag) =>
    candidateRecipe.tags.includes(tag)
  );
  score += commonTags.length * 15;

  // Same author gets bonus
  if (currentRecipe.author.id === candidateRecipe.author.id) {
    score += 10;
  }

  // Popularity bonus
  score += candidateRecipe.stats.rating * 2;
  score += Math.min(candidateRecipe.stats.favoriteCount / 50, 10);

  return score;
}

// Format time helper
function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Difficulty color helper
function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Hard':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function RecipeRelated({
  currentRecipe,
  limit = 4,
  className = '',
}: RecipeRelatedProps) {
  const [relatedRecipes, setRelatedRecipes] = useState<RelatedRecipe[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Filter out current recipe and calculate relevance scores
      const candidates = mockRelatedRecipes
        .filter((recipe) => recipe.id !== currentRecipe.id)
        .map((recipe) => ({
          ...recipe,
          relevanceScore: calculateRelevanceScore(currentRecipe, recipe),
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      setRelatedRecipes(candidates);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentRecipe, limit]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev >= relatedRecipes.length - 2 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev <= 0 ? Math.max(0, relatedRecipes.length - 2) : prev - 1
    );
  };

  if (isLoading) {
    return (
      <section className={`related-recipes-section ${className}`}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Related Recipes
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-[4/3] rounded-t-lg bg-gray-200" />
                <CardContent className="p-4">
                  <div className="mb-2 h-4 rounded bg-gray-200" />
                  <div className="mb-4 h-3 w-3/4 rounded bg-gray-200" />
                  <div className="flex justify-between">
                    <div className="h-3 w-1/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/4 rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (relatedRecipes.length === 0) {
    return (
      <section className={`related-recipes-section ${className}`}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Related Recipes
          </h2>
          <div className="py-12 text-center">
            <ChefHat className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No related recipes found
            </h3>
            <p className="text-gray-600">
              Check back later as more recipes are added to the community!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`related-recipes-section ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Related Recipes</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={relatedRecipes.length <= 2}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={relatedRecipes.length <= 2}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-4">
          {relatedRecipes.map((recipe) => (
            <RelatedRecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        {/* Mobile/Tablet Carousel View */}
        <div className="relative overflow-hidden lg:hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
              width: `${relatedRecipes.length * 100}%`,
            }}
          >
            {relatedRecipes.map((recipe) => (
              <div key={recipe.id} className="w-full flex-shrink-0 px-2">
                <RelatedRecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots for Mobile */}
        {relatedRecipes.length > 1 && (
          <div className="mt-6 flex justify-center space-x-2 lg:hidden">
            {relatedRecipes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Individual recipe card component
function RelatedRecipeCard({ recipe }: { recipe: RelatedRecipe }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const totalTime = recipe.stats.prepTime + recipe.stats.cookTime;

  return (
    <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-3 right-3 rounded-full bg-white/90 p-2 shadow-sm transition-all duration-200 hover:scale-110 hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorited
                ? 'fill-red-500 text-red-500'
                : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>

        {/* Difficulty Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className={`text-xs font-medium ${getDifficultyColor(recipe.stats.difficulty)}`}
          >
            {recipe.stats.difficulty}
          </Badge>
        </div>

        {/* Quick Stats Overlay */}
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(totalTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{recipe.stats.servings}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{recipe.stats.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Description */}
          <div>
            <h3 className="line-clamp-1 font-semibold text-gray-900 transition-colors group-hover:text-orange-600">
              {recipe.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {recipe.description}
            </p>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full bg-gray-200">
              {recipe.author.avatar ? (
                <Image
                  src={recipe.author.avatar}
                  alt={recipe.author.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-orange-100">
                  <span className="text-xs font-medium text-orange-600">
                    {recipe.author.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600">{recipe.author.name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{recipe.stats.viewCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{recipe.stats.favoriteCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>({recipe.stats.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge
                variant="outline"
                className="border-gray-200 px-2 py-0.5 text-xs text-gray-600"
              >
                +{recipe.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* View Recipe Link */}
        <Link href={`/recipes/${recipe.id}`} className="mt-4 block">
          <Button
            variant="outline"
            size="sm"
            className="w-full transition-colors group-hover:border-orange-200 group-hover:bg-orange-50 group-hover:text-orange-600"
          >
            View Recipe
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

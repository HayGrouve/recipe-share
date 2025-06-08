'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  Users,
  BookOpen,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Mock data for featured recipes
const featuredRecipes = [
  {
    id: 1,
    title: 'Creamy Mushroom Risotto',
    image: '/api/placeholder/400/300',
    prepTime: '35 min',
    difficulty: 'Medium',
    rating: 4.8,
    author: 'Sarah Chen',
    description: 'Rich and creamy risotto with wild mushrooms and fresh herbs.',
    category: 'Italian',
  },
  {
    id: 2,
    title: 'Thai Green Curry',
    image: '/api/placeholder/400/300',
    prepTime: '25 min',
    difficulty: 'Easy',
    rating: 4.9,
    author: 'Mike Johnson',
    description:
      'Authentic Thai green curry with coconut milk and fresh vegetables.',
    category: 'Thai',
  },
  {
    id: 3,
    title: 'Chocolate Lava Cake',
    image: '/api/placeholder/400/300',
    prepTime: '20 min',
    difficulty: 'Hard',
    rating: 4.7,
    author: 'Emma Wilson',
    description: 'Decadent chocolate cake with a molten center.',
    category: 'Dessert',
  },
  {
    id: 4,
    title: 'Mediterranean Quinoa Bowl',
    image: '/api/placeholder/400/300',
    prepTime: '15 min',
    difficulty: 'Easy',
    rating: 4.6,
    author: 'Alex Rodriguez',
    description:
      'Healthy quinoa bowl with roasted vegetables and tahini dressing.',
    category: 'Healthy',
  },
  {
    id: 5,
    title: 'Classic Beef Tacos',
    image: '/api/placeholder/400/300',
    prepTime: '30 min',
    difficulty: 'Medium',
    rating: 4.8,
    author: 'Luis Martinez',
    description: 'Traditional beef tacos with fresh salsa and guacamole.',
    category: 'Mexican',
  },
];

function RecipeCard({ recipe }: { recipe: (typeof featuredRecipes)[0] }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <Card className="group overflow-hidden bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            {recipe.category}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-gray-900">
          {recipe.title}
        </h3>

        <p className="mb-3 line-clamp-2 text-sm text-gray-600">
          {recipe.description}
        </p>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{recipe.rating}</span>
            </div>
          </div>

          <Badge className={getDifficultyColor(recipe.difficulty)}>
            {recipe.difficulty}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>by {recipe.author}</span>
          </div>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
          >
            <Link href={`/recipes/${recipe.id}`}>View Recipe</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeaturedRecipesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    skipSnaps: false,
    loop: true,
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="bg-gray-50 py-16">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Featured Recipes
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Discover the most loved recipes from our community
            </p>
          </div>

          <div className="hidden gap-2 sm:flex">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous recipes</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next recipes</span>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {featuredRecipes.map((recipe) => (
              <div key={recipe.id} className="w-80 flex-none">
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="mt-6 flex justify-center gap-2 sm:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="h-10 w-10 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous recipes</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="h-10 w-10 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next recipes</span>
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/recipes">
              <BookOpen className="mr-2 h-5 w-5" />
              View All Recipes
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

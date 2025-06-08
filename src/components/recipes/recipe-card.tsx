import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, Users, Heart, BookmarkPlus, ChefHat } from 'lucide-react';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  ratingCount: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  cuisine: string;
  dietaryRestrictions: string[];
  tags: string[];
  isBookmarked?: boolean;
  isLiked?: boolean;
  createdAt: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  onBookmark?: (recipeId: string) => void;
  onLike?: (recipeId: string) => void;
  size?: 'default' | 'compact';
}

export function RecipeCard({
  recipe,
  onBookmark,
  onLike,
  size = 'default',
}: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
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

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(recipe.id);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(recipe.id);
  };

  return (
    <Card className="group hover:border-primary/20 overflow-hidden border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <Link href={`/recipes/${recipe.id}`} className="block">
        {/* Image Section */}
        <div
          className={`relative overflow-hidden ${size === 'compact' ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}
        >
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Overlay Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white ${
                recipe.isBookmarked ? 'text-primary' : 'text-gray-600'
              }`}
              onClick={handleBookmark}
            >
              <BookmarkPlus className="h-4 w-4" />
              <span className="sr-only">Bookmark recipe</span>
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white ${
                recipe.isLiked ? 'text-red-500' : 'text-gray-600'
              }`}
              onClick={handleLike}
            >
              <Heart
                className={`h-4 w-4 ${recipe.isLiked ? 'fill-current' : ''}`}
              />
              <span className="sr-only">Like recipe</span>
            </Button>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-white/90 text-gray-700 backdrop-blur-sm"
            >
              {recipe.category}
            </Badge>
          </div>

          {/* Difficulty Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className={getDifficultyColor(recipe.difficulty)}>
              {recipe.difficulty}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className={size === 'compact' ? 'p-3' : 'p-4'}>
          {/* Title */}
          <h3
            className={`group-hover:text-primary mb-2 line-clamp-2 font-semibold text-gray-900 transition-colors ${
              size === 'compact' ? 'text-sm' : 'text-lg'
            }`}
          >
            {recipe.title}
          </h3>

          {/* Description */}
          {size !== 'compact' && (
            <p className="mb-3 line-clamp-2 text-sm text-gray-600">
              {recipe.description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{totalTime} min</span>
              </div>

              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings}</span>
              </div>

              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{recipe.rating.toFixed(1)}</span>
                {size !== 'compact' && (
                  <span className="text-gray-400">({recipe.ratingCount})</span>
                )}
              </div>
            </div>
          </div>

          {/* Dietary Restrictions Tags */}
          {recipe.dietaryRestrictions.length > 0 && size !== 'compact' && (
            <div className="mb-3 flex flex-wrap gap-1">
              {recipe.dietaryRestrictions.slice(0, 3).map((restriction) => (
                <Badge
                  key={restriction}
                  variant="outline"
                  className="bg-primary/5 border-primary/20 text-primary px-2 py-1 text-xs"
                >
                  {restriction}
                </Badge>
              ))}
              {recipe.dietaryRestrictions.length > 3 && (
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  +{recipe.dietaryRestrictions.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {recipe.author.avatar ? (
                <div className="relative h-6 w-6 overflow-hidden rounded-full">
                  <Image
                    src={recipe.author.avatar}
                    alt={recipe.author.name}
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                </div>
              ) : (
                <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                  <ChefHat className="text-primary h-3 w-3" />
                </div>
              )}
              <span className="truncate text-sm text-gray-600">
                {recipe.author.name}
              </span>
            </div>

            {/* Cuisine */}
            <span className="text-xs tracking-wide text-gray-400 uppercase">
              {recipe.cuisine}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

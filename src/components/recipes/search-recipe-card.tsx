import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, User } from 'lucide-react';

interface SearchRecipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl: string | null;
  averageRating: number | null;
  totalRatings: number;
  authorName: string;
  authorImage: string | null;
}

interface SearchRecipeCardProps {
  recipe: SearchRecipe;
  variant?: 'vertical' | 'horizontal';
}

export function SearchRecipeCard({
  recipe,
  variant = 'vertical',
}: SearchRecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  const getDifficultyColor = (difficulty: SearchRecipe['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (variant === 'horizontal') {
    return (
      <Card className="group hover:border-primary/20 overflow-hidden border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
        <Link href={`/recipes/${recipe.id}`} className="block">
          <div className="flex">
            {/* Image Section */}
            <div className="relative aspect-[4/3] w-48 flex-shrink-0 overflow-hidden">
              <Image
                src={recipe.imageUrl || '/api/placeholder/300/225'}
                alt={recipe.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="192px"
              />

              {/* Difficulty Badge */}
              <div className="absolute bottom-2 left-2">
                <Badge className={getDifficultyColor(recipe.difficulty)}>
                  {recipe.difficulty}
                </Badge>
              </div>
            </div>

            {/* Content Section */}
            <CardContent className="flex-1 p-4">
              <h3 className="group-hover:text-primary mb-2 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors">
                {recipe.title}
              </h3>

              <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                {recipe.description}
              </p>

              {/* Metadata */}
              <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{totalTime} min</span>
                </div>

                {recipe.averageRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{recipe.averageRating.toFixed(1)}</span>
                    <span className="text-gray-400">
                      ({recipe.totalRatings})
                    </span>
                  </div>
                )}
              </div>

              {/* Author */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>by {recipe.authorName}</span>
              </div>
            </CardContent>
          </div>
        </Link>
      </Card>
    );
  }

  // Vertical layout (default)
  return (
    <Card className="group hover:border-primary/20 overflow-hidden border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <Link href={`/recipes/${recipe.id}`} className="block">
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={recipe.imageUrl || '/api/placeholder/400/300'}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Difficulty Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className={getDifficultyColor(recipe.difficulty)}>
              {recipe.difficulty}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          <h3 className="group-hover:text-primary mb-2 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors">
            {recipe.title}
          </h3>

          <p className="mb-3 line-clamp-2 text-sm text-gray-600">
            {recipe.description}
          </p>

          {/* Metadata Row */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{totalTime} min</span>
              </div>

              {recipe.averageRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{recipe.averageRating.toFixed(1)}</span>
                  <span className="text-gray-400">({recipe.totalRatings})</span>
                </div>
              )}
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>by {recipe.authorName}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

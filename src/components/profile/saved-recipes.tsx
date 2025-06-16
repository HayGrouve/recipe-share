'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SavedRecipe {
  id: string;
  title: string;
  description: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  isPublished: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  savedAt: Date;
  author: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
}

interface SavedRecipeResponse {
  id: string;
  title: string;
  description: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  isPublished: boolean | null;
  createdAt: string;
  updatedAt: string;
  savedAt: string;
  author: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
}

interface SavedRecipesProps {
  userId: string;
  isOwnProfile?: boolean;
  className?: string;
}

export function SavedRecipes({
  userId,
  isOwnProfile = false,
  className,
}: SavedRecipesProps) {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    loadSavedRecipes(0, true);
  }, [userId]);

  const loadSavedRecipes = async (newOffset: number, replace = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/users/${userId}/saved-recipes?limit=${limit}&offset=${newOffset}`
      );
      const data = await response.json();

      if (data.success) {
        const recipes = data.data.recipes.map(
          (recipe: SavedRecipeResponse) => ({
            ...recipe,
            createdAt: new Date(recipe.createdAt),
            updatedAt: new Date(recipe.updatedAt),
            savedAt: new Date(recipe.savedAt),
          })
        );

        setSavedRecipes((prev) => (replace ? recipes : [...prev, ...recipes]));
        setHasMore(data.data.pagination.hasMore);
        setTotal(data.data.pagination.total);
        setOffset(newOffset);
      } else {
        toast.error(data.error || 'Failed to load saved recipes');
      }
    } catch (error) {
      console.error('Error loading saved recipes:', error);
      toast.error('Failed to load saved recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    const newOffset = offset + limit;
    loadSavedRecipes(newOffset, false);
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (isLoading && savedRecipes.length === 0) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Bookmark className="h-4 w-4" />
          Loading saved recipes...
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="bg-muted h-48 animate-pulse" />
              <CardContent className="space-y-2 p-4">
                <div className="bg-muted h-5 animate-pulse rounded" />
                <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="bg-muted h-6 w-16 animate-pulse rounded" />
                  <div className="bg-muted h-6 w-16 animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (savedRecipes.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <Bookmark className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-medium">
          {isOwnProfile ? 'No saved recipes yet' : 'No saved recipes'}
        </h3>
        <p className="text-muted-foreground">
          {isOwnProfile
            ? 'Start saving recipes you love by clicking the bookmark icon on any recipe.'
            : "This user hasn't saved any public recipes yet."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Bookmark className="h-4 w-4" />
          {total} {total === 1 ? 'recipe' : 'recipes'} saved
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savedRecipes.map((recipe) => (
          <Card
            key={recipe.id}
            className="overflow-hidden transition-shadow hover:shadow-md"
          >
            <Link href={`/recipes/${recipe.id}`}>
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                <span className="text-4xl">🍽️</span>
              </div>
            </Link>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="hover:text-primary line-clamp-2 font-semibold transition-colors"
                  >
                    {recipe.title}
                  </Link>
                  {recipe.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      {recipe.description}
                    </p>
                  )}
                </div>

                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span>by</span>
                  <Link
                    href={`/profile/${recipe.author.id}`}
                    className="hover:text-primary font-medium transition-colors"
                  >
                    {recipe.author.name}
                  </Link>
                </div>

                <div className="text-muted-foreground flex items-center gap-4 text-xs">
                  {(recipe.prepTime || recipe.cookTime) && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {[recipe.prepTime, recipe.cookTime]
                          .filter(Boolean)
                          .map(formatTime)
                          .join(' + ')}
                      </span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{recipe.servings} servings</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    Saved{' '}
                    {formatDistanceToNow(recipe.savedAt, { addSuffix: true })}
                  </Badge>
                  {!recipe.isPublished && (
                    <Badge variant="outline" className="text-xs">
                      Draft
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button onClick={loadMore} disabled={isLoading} variant="outline">
            {isLoading ? 'Loading...' : 'Load more recipes'}
          </Button>
        </div>
      )}
    </div>
  );
}

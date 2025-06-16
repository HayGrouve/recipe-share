'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Search,
  Grid3X3,
  List,
  Plus,
  Star,
  Clock,
  Users,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Recipe {
  id: string;
  title: string;
  description: string;
  images: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'private';
  cuisine: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  rating: number;
  ratingCount: number;
  saveCount: number;
  commentsCount: number;
}

interface DashboardStats {
  totalRecipes: number;
  publishedRecipes: number;
  draftRecipes: number;
  totalViews: number;
  averageRating: number;
  totalSaves: number;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'title' | 'rating' | 'views';
type FilterStatus = 'all' | 'published' | 'draft' | 'private';

export function RecipeDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // State management
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(
    new Set()
  );
  const [stats, setStats] = useState<DashboardStats>({
    totalRecipes: 0,
    publishedRecipes: 0,
    draftRecipes: 0,
    totalViews: 0,
    averageRating: 0,
    totalSaves: 0,
  });

  // Load user recipes
  const loadUserRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/recipes/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load recipes');
      }

      const data = await response.json();
      setRecipes(data.recipes || []);
      setStats(data.stats || stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    loadUserRecipes();
  }, [isLoaded, user, loadUserRecipes]);

  // Filter and sort recipes
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query) ||
          recipe.cuisine.toLowerCase().includes(query) ||
          recipe.category.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((recipe) => recipe.status === filterStatus);
    }

    // Apply sorting
    const sortedRecipes = [...filtered];
    sortedRecipes.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'title':
          return a.title.localeCompare(b.title);
        case 'rating':
          return b.rating - a.rating;
        case 'views':
          return b.viewCount - a.viewCount;
        default:
          return 0;
      }
    });

    return sortedRecipes;
  }, [recipes, searchQuery, filterStatus, sortBy]);

  // Handle recipe actions
  const handleRecipeAction = async (action: string, recipeId: string) => {
    switch (action) {
      case 'view':
        router.push(`/recipes/${recipeId}`);
        break;
      case 'edit':
        router.push(`/recipes/create?mode=edit&id=${recipeId}`);
        break;
      case 'duplicate':
        try {
          const response = await fetch(`/api/recipes/${recipeId}/duplicate`, {
            method: 'POST',
          });
          if (response.ok) {
            loadUserRecipes(); // Reload recipes
          }
        } catch (err) {
          console.error('Failed to duplicate recipe:', err);
        }
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this recipe?')) {
          try {
            const response = await fetch(`/api/recipes/${recipeId}`, {
              method: 'DELETE',
            });
            if (response.ok) {
              loadUserRecipes(); // Reload recipes
            }
          } catch (err) {
            console.error('Failed to delete recipe:', err);
          }
        }
        break;
    }
  };

  // Handle bulk selection
  const toggleRecipeSelection = (recipeId: string) => {
    const newSelection = new Set(selectedRecipes);
    if (newSelection.has(recipeId)) {
      newSelection.delete(recipeId);
    } else {
      newSelection.add(recipeId);
    }
    setSelectedRecipes(newSelection);
  };

  const selectAllRecipes = () => {
    if (selectedRecipes.size === filteredAndSortedRecipes.length) {
      setSelectedRecipes(new Set());
    } else {
      setSelectedRecipes(new Set(filteredAndSortedRecipes.map((r) => r.id)));
    }
  };

  // Recipe card component for grid view
  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Card className="group transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedRecipes.has(recipe.id)}
              onChange={() => toggleRecipeSelection(recipe.id)}
              className="rounded border-gray-300"
            />
            <Badge
              variant={recipe.status === 'published' ? 'default' : 'secondary'}
            >
              {recipe.status}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleRecipeAction('view', recipe.id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRecipeAction('edit', recipe.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRecipeAction('duplicate', recipe.id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleRecipeAction('delete', recipe.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {recipe.images[0] && (
          <img
            src={recipe.images[0]}
            alt={recipe.title}
            className="h-48 w-full rounded-md object-cover"
          />
        )}

        <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
        <p className="line-clamp-2 text-sm text-gray-600">
          {recipe.description}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {recipe.prepTime + recipe.cookTime}m
            </div>
            <div className="flex items-center">
              <Users className="mr-1 h-3 w-3" />
              {recipe.servings}
            </div>
            <div className="flex items-center">
              <Star className="mr-1 h-3 w-3" />
              {recipe.rating.toFixed(1)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span>{recipe.viewCount} views</span>
            <span>•</span>
            <span>{recipe.saveCount} saves</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Recipe row component for list view
  const RecipeRow = ({ recipe }: { recipe: Recipe }) => (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <input
              type="checkbox"
              checked={selectedRecipes.has(recipe.id)}
              onChange={() => toggleRecipeSelection(recipe.id)}
              className="rounded border-gray-300"
            />

            {recipe.images[0] && (
              <img
                src={recipe.images[0]}
                alt={recipe.title}
                className="h-16 w-16 rounded-md object-cover"
              />
            )}

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center space-x-2">
                <h3 className="truncate text-lg font-semibold">
                  {recipe.title}
                </h3>
                <Badge
                  variant={
                    recipe.status === 'published' ? 'default' : 'secondary'
                  }
                >
                  {recipe.status}
                </Badge>
              </div>
              <p className="line-clamp-1 text-sm text-gray-600">
                {recipe.description}
              </p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>{recipe.cuisine}</span>
                <span>•</span>
                <span>{recipe.prepTime + recipe.cookTime}m</span>
                <span>•</span>
                <span>{recipe.servings} servings</span>
                <span>•</span>
                <span>{recipe.viewCount} views</span>
                <span>•</span>
                <span>{recipe.rating.toFixed(1)} ★</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleRecipeAction('view', recipe.id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRecipeAction('edit', recipe.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRecipeAction('duplicate', recipe.id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleRecipeAction('delete', recipe.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Recipes
                </p>
                <p className="text-2xl font-bold">{stats.totalRecipes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold">{stats.publishedRecipes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col items-start gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search your recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:w-64"
            />
          </div>

          {/* Filters */}
          <Select
            value={filterStatus}
            onValueChange={(value: FilterStatus) => setFilterStatus(value)}
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="views">Views</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {selectedRecipes.size > 0 && (
            <div className="mr-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedRecipes.size} selected
              </span>
              <Button variant="outline" size="sm">
                Delete Selected
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex items-center rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Create Recipe */}
          <Button onClick={() => router.push('/recipes/create')}>
            <Plus className="mr-2 h-4 w-4" />
            New Recipe
          </Button>
        </div>
      </div>

      {/* Bulk Selection */}
      {filteredAndSortedRecipes.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedRecipes.size === filteredAndSortedRecipes.length}
            onChange={selectAllRecipes}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-600">
            Select all {filteredAndSortedRecipes.length} recipes
          </span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadUserRecipes} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAndSortedRecipes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 h-24 w-24 text-gray-400">
              <Plus className="h-full w-full" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {searchQuery || filterStatus !== 'all'
                ? 'No recipes found'
                : 'No recipes yet'}
            </h3>
            <p className="mb-6 text-gray-600">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start your culinary journey by creating your first recipe!'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={() => router.push('/recipes/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Recipe
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recipes Grid/List */}
      {!loading && !error && filteredAndSortedRecipes.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-2'
          }
        >
          {filteredAndSortedRecipes.map((recipe) =>
            viewMode === 'grid' ? (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ) : (
              <RecipeRow key={recipe.id} recipe={recipe} />
            )
          )}
        </div>
      )}
    </div>
  );
}

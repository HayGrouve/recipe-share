'use client';

import { useState } from 'react';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { useRecipeSearch } from '@/hooks/use-recipe-search';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { RecipeCardSkeletonGrid } from '@/components/ui/skeleton-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  Loader2,
} from 'lucide-react';

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] =
    useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [useInfiniteScrollMode, setUseInfiniteScrollMode] = useState(true);

  // Use the React Query hook for search
  const {
    recipes,
    pagination,
    availableFilters,
    isLoading,
    isFetching,
    isError,
    error,
    isEmpty,
    isSearching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRecipeSearch({
    searchQuery,
    filters: {
      category: selectedCategory,
      cuisine: selectedCuisine,
      difficulty: selectedDifficulty,
      dietaryRestrictions: selectedDietaryRestrictions,
      sortBy,
    },
    limit: 12,
    useInfiniteScroll: useInfiniteScrollMode,
  });

  // Infinite scroll hook
  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage: hasNextPage || false,
    isFetchingNextPage: isFetchingNextPage || false,
    fetchNextPage: fetchNextPage || (() => {}),
  });

  const handleBookmark = (recipeId: string) => {
    console.log('Bookmark recipe:', recipeId);
    // TODO: Implement bookmark functionality
  };

  const handleLike = (recipeId: string) => {
    console.log('Like recipe:', recipeId);
    // TODO: Implement like functionality
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCuisine('');
    setSelectedDifficulty('');
    setSelectedDietaryRestrictions([]);
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedCuisine,
    selectedDifficulty,
    ...(selectedDietaryRestrictions.length > 0 ? ['dietary'] : []),
  ].filter(Boolean).length;

  // Show error state
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Something went wrong
          </h2>
          <p className="mb-4 text-gray-600">
            {error instanceof Error ? error.message : 'Failed to load recipes'}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                Discover Recipes
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={useInfiniteScrollMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setUseInfiniteScrollMode(!useInfiniteScrollMode)
                  }
                  title={
                    useInfiniteScrollMode
                      ? 'Switch to pagination'
                      : 'Switch to infinite scroll'
                  }
                >
                  {useInfiniteScrollMode ? 'Auto Load' : 'Load More'}
                </Button>
              </div>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recipes, ingredients, or chefs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus:ring-primary w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2"
                />
                {isSearching && (
                  <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="focus:ring-primary appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 focus:border-transparent focus:ring-2"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="prepTime">Quickest</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {/* Category Filter */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
                    >
                      <option value="">All Categories</option>
                      {availableFilters?.categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cuisine Filter */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Cuisine
                    </label>
                    <select
                      value={selectedCuisine}
                      onChange={(e) => setSelectedCuisine(e.target.value)}
                      className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
                    >
                      <option value="">All Cuisines</option>
                      {availableFilters?.cuisines.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>
                          {cuisine}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Difficulty
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
                    >
                      <option value="">All Levels</option>
                      {availableFilters?.difficulties.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dietary Restrictions Filter */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Dietary Restrictions
                    </label>
                    <div className="max-h-32 space-y-2 overflow-y-auto">
                      {availableFilters?.dietaryRestrictions.map(
                        (restriction) => (
                          <label
                            key={restriction}
                            className="flex items-center"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDietaryRestrictions.includes(
                                restriction
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDietaryRestrictions([
                                    ...selectedDietaryRestrictions,
                                    restriction,
                                  ]);
                                } else {
                                  setSelectedDietaryRestrictions(
                                    selectedDietaryRestrictions.filter(
                                      (r) => r !== restriction
                                    )
                                  );
                                }
                              }}
                              className="text-primary focus:ring-primary rounded border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {restriction}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-gray-600">
              {pagination?.total || 0} recipe
              {(pagination?.total || 0) !== 1 ? 's' : ''} found
            </p>
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>

          {/* Active Filters */}
          {(selectedCategory ||
            selectedCuisine ||
            selectedDifficulty ||
            selectedDietaryRestrictions.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('')}
                >
                  {selectedCategory} ✕
                </Badge>
              )}
              {selectedCuisine && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setSelectedCuisine('')}
                >
                  {selectedCuisine} ✕
                </Badge>
              )}
              {selectedDifficulty && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setSelectedDifficulty('')}
                >
                  {selectedDifficulty} ✕
                </Badge>
              )}
              {selectedDietaryRestrictions.map((restriction) => (
                <Badge
                  key={restriction}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedDietaryRestrictions(
                      selectedDietaryRestrictions.filter(
                        (r) => r !== restriction
                      )
                    )
                  }
                >
                  {restriction} ✕
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && <RecipeCardSkeletonGrid count={12} viewMode={viewMode} />}

        {/* Recipe Grid */}
        {!isLoading && recipes.length > 0 && (
          <>
            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'mx-auto max-w-4xl grid-cols-1'
              }`}
            >
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onBookmark={handleBookmark}
                  onLike={handleLike}
                  size={viewMode === 'list' ? 'compact' : 'default'}
                />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {useInfiniteScrollMode && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <div className="text-center">
                    <Loader2 className="text-primary mx-auto mb-2 h-6 w-6 animate-spin" />
                    <p className="text-gray-600">Loading more recipes...</p>
                  </div>
                )}
                {!hasNextPage && recipes.length > 0 && (
                  <p className="text-gray-500">
                    You&apos;ve reached the end of the recipes!
                  </p>
                )}
              </div>
            )}

            {/* Load More Button (fallback for infinite scroll) */}
            {!useInfiniteScrollMode && hasNextPage && (
              <div className="flex justify-center py-8">
                <Button
                  onClick={() => fetchNextPage && fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="min-w-32"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Recipes'
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && isEmpty && (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No recipes found
              </h3>
              <p className="mb-4 text-gray-600">
                Try adjusting your search or filter criteria to find more
                recipes.
              </p>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

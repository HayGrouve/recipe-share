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
import { announce } from '@/lib/focus-management';

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
    announce('All filters cleared');
  };

  const removeFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case 'category':
        setSelectedCategory('');
        announce(`${value} category filter removed`);
        break;
      case 'cuisine':
        setSelectedCuisine('');
        announce(`${value} cuisine filter removed`);
        break;
      case 'difficulty':
        setSelectedDifficulty('');
        announce(`${value} difficulty filter removed`);
        break;
      case 'dietary':
        if (value) {
          setSelectedDietaryRestrictions((prev) =>
            prev.filter((r) => r !== value)
          );
          announce(`${value} dietary restriction filter removed`);
        }
        break;
    }
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
        <div className="text-center" role="alert">
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
              <h1
                className="text-3xl font-bold text-gray-900"
                id="main-heading"
              >
                Discover Recipes
              </h1>
              <div
                className="flex items-center gap-2"
                role="toolbar"
                aria-label="View options"
              >
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => {
                    setViewMode('grid');
                    announce('Grid view selected');
                  }}
                  aria-label="Switch to grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid3X3 className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => {
                    setViewMode('list');
                    announce('List view selected');
                  }}
                  aria-label="Switch to list view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant={useInfiniteScrollMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newMode = !useInfiniteScrollMode;
                    setUseInfiniteScrollMode(newMode);
                    announce(
                      newMode
                        ? 'Auto load mode enabled'
                        : 'Manual load more mode enabled'
                    );
                  }}
                  aria-label={
                    useInfiniteScrollMode
                      ? 'Switch to manual pagination'
                      : 'Switch to automatic loading'
                  }
                  aria-pressed={useInfiniteScrollMode}
                >
                  {useInfiniteScrollMode ? 'Auto Load' : 'Load More'}
                </Button>
              </div>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Search */}
              <div className="relative flex-1">
                <label htmlFor="recipe-search" className="sr-only">
                  Search recipes, ingredients, or chefs
                </label>
                <Search
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="recipe-search"
                  type="text"
                  placeholder="Search recipes, ingredients, or chefs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus:ring-primary w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2"
                  aria-describedby="search-status"
                />
                <div id="search-status" className="sr-only" aria-live="polite">
                  {isSearching ? 'Searching recipes...' : null}
                  {searchQuery && !isSearching
                    ? `Search results for "${searchQuery}": ${pagination?.total || 0} recipes found`
                    : null}
                </div>
                {isSearching && (
                  <Loader2
                    className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400"
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <label htmlFor="sort-select" className="sr-only">
                  Sort recipes by
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    const sortLabels: Record<string, string> = {
                      newest: 'newest first',
                      oldest: 'oldest first',
                      rating: 'highest rated',
                      prepTime: 'quickest',
                      alphabetical: 'alphabetical',
                      popular: 'most popular',
                    };
                    announce(
                      `Sorting by ${sortLabels[e.target.value] || e.target.value}`
                    );
                  }}
                  className="focus:ring-primary appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 focus:border-transparent focus:ring-2"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="prepTime">Quickest</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => {
                  const newState = !showFilters;
                  setShowFilters(newState);
                  announce(
                    newState ? 'Filters panel opened' : 'Filters panel closed'
                  );
                }}
                className="relative"
                aria-expanded={showFilters}
                aria-controls="filters-panel"
                aria-label={`${showFilters ? 'Hide' : 'Show'} recipe filters${activeFiltersCount > 0 ? ` (${activeFiltersCount} active)` : ''}`}
              >
                <SlidersHorizontal
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                    aria-label={`${activeFiltersCount} active filters`}
                  >
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
                  <CardTitle className="text-lg" id="filters-title">
                    Filters
                  </CardTitle>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      aria-label={`Clear all ${activeFiltersCount} active filters`}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div
                  id="filters-panel"
                  className="grid grid-cols-1 gap-4 md:grid-cols-4"
                  role="region"
                  aria-labelledby="filters-title"
                >
                  {/* Category Filter */}
                  <div>
                    <label
                      htmlFor="category-select"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Category
                    </label>
                    <select
                      id="category-select"
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        if (e.target.value) {
                          announce(`${e.target.value} category selected`);
                        } else {
                          announce('Category filter cleared');
                        }
                      }}
                      className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
                      aria-describedby="category-help"
                    >
                      <option value="">All Categories</option>
                      {availableFilters?.categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div id="category-help" className="sr-only">
                      Filter recipes by category type
                    </div>
                  </div>

                  {/* Cuisine Filter */}
                  <div>
                    <label
                      htmlFor="cuisine-select"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Cuisine
                    </label>
                    <select
                      id="cuisine-select"
                      value={selectedCuisine}
                      onChange={(e) => {
                        setSelectedCuisine(e.target.value);
                        if (e.target.value) {
                          announce(`${e.target.value} cuisine selected`);
                        } else {
                          announce('Cuisine filter cleared');
                        }
                      }}
                      className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
                      aria-describedby="cuisine-help"
                    >
                      <option value="">All Cuisines</option>
                      {availableFilters?.cuisines.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>
                          {cuisine}
                        </option>
                      ))}
                    </select>
                    <div id="cuisine-help" className="sr-only">
                      Filter recipes by cuisine style
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label
                      htmlFor="difficulty-select"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Difficulty
                    </label>
                    <select
                      id="difficulty-select"
                      value={selectedDifficulty}
                      onChange={(e) => {
                        setSelectedDifficulty(e.target.value);
                        if (e.target.value) {
                          announce(`${e.target.value} difficulty selected`);
                        } else {
                          announce('Difficulty filter cleared');
                        }
                      }}
                      className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
                      aria-describedby="difficulty-help"
                    >
                      <option value="">All Levels</option>
                      {availableFilters?.difficulties.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty}
                        </option>
                      ))}
                    </select>
                    <div id="difficulty-help" className="sr-only">
                      Filter recipes by cooking difficulty level
                    </div>
                  </div>

                  {/* Dietary Restrictions Filter */}
                  <div>
                    <fieldset>
                      <legend className="mb-2 block text-sm font-medium text-gray-700">
                        Dietary Restrictions
                      </legend>
                      <div
                        className="max-h-32 space-y-2 overflow-y-auto"
                        role="group"
                        aria-labelledby="dietary-restrictions-legend"
                        aria-describedby="dietary-help"
                      >
                        {availableFilters?.dietaryRestrictions.map(
                          (restriction) => (
                            <label
                              key={restriction}
                              className="flex cursor-pointer items-center rounded px-1 py-0.5 hover:bg-gray-50"
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
                                    announce(
                                      `${restriction} dietary restriction added`
                                    );
                                  } else {
                                    setSelectedDietaryRestrictions(
                                      selectedDietaryRestrictions.filter(
                                        (r) => r !== restriction
                                      )
                                    );
                                    announce(
                                      `${restriction} dietary restriction removed`
                                    );
                                  }
                                }}
                                className="text-primary focus:ring-primary rounded border-gray-300"
                                aria-describedby={`${restriction}-desc`}
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {restriction}
                              </span>
                              <span
                                id={`${restriction}-desc`}
                                className="sr-only"
                              >
                                Filter recipes that are {restriction}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                      <div id="dietary-help" className="sr-only">
                        Select dietary restrictions to filter recipes
                      </div>
                    </fieldset>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Results */}
      <main className="container mx-auto px-4 py-6" id="main-content">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-gray-600" role="status" aria-live="polite">
              {pagination?.total || 0} recipe
              {(pagination?.total || 0) !== 1 ? 's' : ''} found
            </p>
            {isFetching && (
              <Loader2
                className="h-4 w-4 animate-spin text-gray-400"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Active Filters */}
          {(selectedCategory ||
            selectedCuisine ||
            selectedDifficulty ||
            selectedDietaryRestrictions.length > 0) && (
            <div
              className="flex flex-wrap gap-2"
              role="region"
              aria-label="Active filters"
            >
              {selectedCategory && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer transition-colors hover:bg-gray-300"
                  onClick={() => removeFilter('category', selectedCategory)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${selectedCategory} category filter`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      removeFilter('category', selectedCategory);
                    }
                  }}
                >
                  {selectedCategory} <span aria-hidden="true">✕</span>
                </Badge>
              )}
              {selectedCuisine && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer transition-colors hover:bg-gray-300"
                  onClick={() => removeFilter('cuisine', selectedCuisine)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${selectedCuisine} cuisine filter`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      removeFilter('cuisine', selectedCuisine);
                    }
                  }}
                >
                  {selectedCuisine} <span aria-hidden="true">✕</span>
                </Badge>
              )}
              {selectedDifficulty && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer transition-colors hover:bg-gray-300"
                  onClick={() => removeFilter('difficulty', selectedDifficulty)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${selectedDifficulty} difficulty filter`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      removeFilter('difficulty', selectedDifficulty);
                    }
                  }}
                >
                  {selectedDifficulty} <span aria-hidden="true">✕</span>
                </Badge>
              )}
              {selectedDietaryRestrictions.map((restriction) => (
                <Badge
                  key={restriction}
                  variant="secondary"
                  className="cursor-pointer transition-colors hover:bg-gray-300"
                  onClick={() => removeFilter('dietary', restriction)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${restriction} dietary restriction filter`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      removeFilter('dietary', restriction);
                    }
                  }}
                >
                  {restriction} <span aria-hidden="true">✕</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div role="status" aria-live="polite">
            <span className="sr-only">Loading recipes...</span>
            <RecipeCardSkeletonGrid count={12} viewMode={viewMode} />
          </div>
        )}

        {/* Recipe Grid */}
        {!isLoading && recipes.length > 0 && (
          <>
            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'mx-auto max-w-4xl grid-cols-1'
              }`}
              role="region"
              aria-labelledby="recipes-heading"
              aria-describedby="recipes-description"
            >
              <h2 id="recipes-heading" className="sr-only">
                Recipe Results
              </h2>
              <div id="recipes-description" className="sr-only">
                {recipes.length} recipes displayed in {viewMode} view. Use tab
                to navigate through recipes and enter to view details.
              </div>
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
                  <div className="text-center" role="status" aria-live="polite">
                    <Loader2
                      className="text-primary mx-auto mb-2 h-6 w-6 animate-spin"
                      aria-hidden="true"
                    />
                    <p className="text-gray-600">Loading more recipes...</p>
                  </div>
                )}
                {!hasNextPage && recipes.length > 0 && (
                  <p className="text-gray-500" role="status">
                    You&apos;ve reached the end of the recipes!
                  </p>
                )}
              </div>
            )}

            {/* Load More Button (fallback for infinite scroll) */}
            {!useInfiniteScrollMode && hasNextPage && (
              <div className="flex justify-center py-8">
                <Button
                  onClick={() => {
                    if (fetchNextPage) {
                      fetchNextPage();
                    }
                    announce('Loading more recipes');
                  }}
                  disabled={isFetchingNextPage}
                  className="min-w-32"
                  aria-describedby="load-more-description"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Loading...
                    </>
                  ) : (
                    'Load More Recipes'
                  )}
                </Button>
                <div id="load-more-description" className="sr-only">
                  Load additional recipes from the search results
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && isEmpty && (
          <div className="py-12 text-center" role="status">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <Search
                  className="h-10 w-10 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No recipes found
              </h3>
              <p className="mb-4 text-gray-600">
                Try adjusting your search or filter criteria to find more
                recipes.
              </p>
              <Button
                onClick={clearAllFilters}
                aria-label="Clear all filters and search"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Live region for search and filter announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" />
      </main>
    </div>
  );
}

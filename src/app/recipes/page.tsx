'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Grid, List, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SimpleSearch } from '@/components/search/simple-search';
import { SearchRecipeCard } from '@/components/recipes/search-recipe-card';
import { cn } from '@/lib/utils';

interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  imageUrl: string | null;
  averageRating: number | null;
  totalRatings: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  category: string | null;
}

interface SearchResults {
  recipes: Recipe[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  searchTerm: string;
  appliedFilters: {
    category?: string;
    tags?: string;
    difficulty?: string;
    sortBy?: string;
  };
}

function RecipesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);

  // Get current search parameters
  const searchQuery = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const sortBy = searchParams.get('sortBy') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1');

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (category) params.set('category', category);
        if (difficulty) params.set('difficulty', difficulty);
        if (sortBy) params.set('sortBy', sortBy);
        params.set('page', page.toString());
        params.set('limit', '12');

        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }

        const results = await response.json();
        setSearchResults(results);
      } catch (err) {
        setError('Failed to load recipes. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a search query
    if (searchQuery) {
      fetchResults();
    } else {
      // For no search query, show empty state or load featured recipes
      setSearchResults(null);
      setLoading(false);
    }
  }, [searchQuery, category, difficulty, sortBy, page]);

  // Update URL parameters
  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Reset to page 1 when changing filters
    if (Object.keys(updates).some((key) => key !== 'page')) {
      newParams.set('page', '1');
    }

    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleSearch = (query: string) => {
    updateParams({ search: query });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    updateParams({ [filterType]: value || null });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  const clearFilters = () => {
    updateParams({
      category: null,
      difficulty: null,
      sortBy: 'relevance',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Recipes'}
        </h1>

        {/* Search Bar */}
        <div className="mb-6">
          <SimpleSearch
            onSearch={handleSearch}
            placeholder="Search recipes, ingredients, or tags..."
            className="w-full max-w-2xl"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <Select
              value={category}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="appetizers">Appetizers</SelectItem>
                <SelectItem value="main-course">Main Course</SelectItem>
                <SelectItem value="desserts">Desserts</SelectItem>
                <SelectItem value="drinks">Drinks</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select
              value={difficulty}
              onValueChange={(value) => handleFilterChange('difficulty', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Any Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Difficulty</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
              value={sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="created">Newest</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {(category || difficulty || sortBy !== 'relevance') && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {searchQuery && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Searching for:
            </span>
            <Badge variant="secondary">{searchQuery}</Badge>
            {category && <Badge variant="outline">Category: {category}</Badge>}
            {difficulty && (
              <Badge variant="outline">Difficulty: {difficulty}</Badge>
            )}
            {sortBy !== 'relevance' && (
              <Badge variant="outline">Sort: {sortBy}</Badge>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Searching recipes...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="py-12 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      )}

      {/* No Search Query State */}
      {!searchQuery && !loading && (
        <div className="py-12 text-center">
          <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="mb-2 text-xl font-semibold">Search for Recipes</h2>
          <p className="text-muted-foreground">
            Use the search bar above to find your favorite recipes
          </p>
        </div>
      )}

      {/* Search Results */}
      {searchResults && !loading && (
        <>
          {/* Results Summary */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              {searchResults.pagination.totalCount} recipe
              {searchResults.pagination.totalCount !== 1 ? 's' : ''} found
              {searchResults.searchTerm && ` for "${searchResults.searchTerm}"`}
            </p>
          </div>

          {/* Recipe Grid/List */}
          {searchResults.recipes.length > 0 ? (
            <div
              className={cn(
                view === 'grid'
                  ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'space-y-4'
              )}
            >
              {searchResults.recipes.map((recipe) => (
                <SearchRecipeCard
                  key={recipe.id}
                  recipe={{
                    id: recipe.id,
                    title: recipe.title,
                    description: recipe.description,
                    prepTime: recipe.prepTime,
                    cookTime: recipe.cookTime,
                    difficulty: (recipe.difficulty.charAt(0).toUpperCase() +
                      recipe.difficulty.slice(1).toLowerCase()) as
                      | 'Easy'
                      | 'Medium'
                      | 'Hard',
                    imageUrl: recipe.imageUrl,
                    averageRating: recipe.averageRating,
                    totalRatings: recipe.totalRatings,
                    authorName: recipe.author.name,
                    authorImage: recipe.author.image,
                  }}
                  variant={view === 'list' ? 'horizontal' : 'vertical'}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h2 className="mb-2 text-xl font-semibold">No recipes found</h2>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </div>
          )}

          {/* Pagination */}
          {searchResults.pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={!searchResults.pagination.hasPrevPage}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, searchResults.pagination.totalPages) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                disabled={!searchResults.pagination.hasNextPage}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <RecipesPageContent />
    </Suspense>
  );
}

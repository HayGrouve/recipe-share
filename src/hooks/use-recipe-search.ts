import { useState, useEffect, useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Recipe } from '@/components/recipes/recipe-card';

interface SearchFilters {
  category?: string;
  cuisine?: string;
  difficulty?: string;
  dietaryRestrictions?: string[];
  sortBy?: string;
}

interface SearchResponse {
  recipes: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    categories: string[];
    cuisines: string[];
    difficulties: string[];
    dietaryRestrictions: string[];
  };
}

interface UseRecipeSearchOptions {
  searchQuery: string;
  filters: SearchFilters;
  limit?: number;
  debounceMs?: number;
  useInfiniteScroll?: boolean;
}

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// API function to fetch recipes
async function fetchRecipes(params: {
  q?: string;
  category?: string;
  cuisine?: string;
  difficulty?: string;
  dietaryRestrictions?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();

  // Add non-empty parameters to search params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(
    `/api/recipes/search?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}

export function useRecipeSearch({
  searchQuery,
  filters,
  limit = 12,
  debounceMs = 400,
  useInfiniteScroll = false,
}: UseRecipeSearchOptions) {
  // Debounce the search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);

  // Base parameters for API calls
  const baseParams = useMemo(
    () => ({
      q: debouncedSearchQuery,
      category: filters.category,
      cuisine: filters.cuisine,
      difficulty: filters.difficulty,
      dietaryRestrictions: filters.dietaryRestrictions?.join(','),
      sortBy: filters.sortBy,
      limit,
    }),
    [debouncedSearchQuery, filters, limit]
  );

  // Infinite query for infinite scroll
  const infiniteQuery = useInfiniteQuery({
    queryKey: ['recipes', 'infinite', baseParams],
    queryFn: ({ pageParam = 1 }) =>
      fetchRecipes({ ...baseParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: useInfiniteScroll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Regular query for pagination
  const regularQuery = useQuery({
    queryKey: ['recipes', 'search', baseParams, { page: 1 }],
    queryFn: () => fetchRecipes({ ...baseParams, page: 1 }),
    enabled: !useInfiniteScroll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Choose which query to use based on infinite scroll setting
  const activeQuery = useInfiniteScroll ? infiniteQuery : regularQuery;

  // Process data for infinite scroll
  const processedData = useMemo(() => {
    if (useInfiniteScroll && infiniteQuery.data) {
      const allRecipes = infiniteQuery.data.pages.flatMap(
        (page) => page.recipes
      );
      const firstPage = infiniteQuery.data.pages[0];
      const lastPage =
        infiniteQuery.data.pages[infiniteQuery.data.pages.length - 1];

      return {
        recipes: allRecipes,
        pagination: {
          ...lastPage.pagination,
          total: firstPage.pagination.total, // Keep original total
        },
        availableFilters: firstPage.filters,
        hasNextPage: lastPage.pagination.hasNextPage,
        fetchNextPage: infiniteQuery.fetchNextPage,
        isFetchingNextPage: infiniteQuery.isFetchingNextPage,
      };
    } else if (!useInfiniteScroll && regularQuery.data) {
      return {
        recipes: regularQuery.data.recipes,
        pagination: regularQuery.data.pagination,
        availableFilters: regularQuery.data.filters,
        hasNextPage: false,
        fetchNextPage: undefined,
        isFetchingNextPage: false,
      };
    }

    return {
      recipes: [],
      pagination: undefined,
      availableFilters: undefined,
      hasNextPage: false,
      fetchNextPage: undefined,
      isFetchingNextPage: false,
    };
  }, [
    useInfiniteScroll,
    infiniteQuery.data,
    regularQuery.data,
    infiniteQuery.fetchNextPage,
    infiniteQuery.isFetchingNextPage,
  ]);

  return {
    // Data
    recipes: processedData.recipes,
    pagination: processedData.pagination,
    availableFilters: processedData.availableFilters,

    // Loading states
    isLoading: activeQuery.isLoading,
    isFetching: activeQuery.isFetching,
    isError: activeQuery.isError,
    error: activeQuery.error,

    // Infinite scroll specific
    hasNextPage: processedData.hasNextPage,
    fetchNextPage: processedData.fetchNextPage,
    isFetchingNextPage: processedData.isFetchingNextPage,

    // Utility functions
    refetch: activeQuery.refetch,

    // Derived states
    isEmpty: !activeQuery.isLoading && processedData.recipes.length === 0,
    isSearching: debouncedSearchQuery !== searchQuery, // True when user is typing
  };
}

// Hook for getting available filter options (cached separately)
export function useRecipeFilters() {
  return useQuery({
    queryKey: ['recipes', 'filters'],
    queryFn: () => fetchRecipes({ limit: 1 }), // Minimal request just to get filter options
    select: (data) => data.filters, // Only return the filters part
    staleTime: 30 * 60 * 1000, // 30 minutes - filters don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

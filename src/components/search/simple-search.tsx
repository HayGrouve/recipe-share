'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  type: 'recent' | 'popular' | 'autocomplete';
  query: string;
  count?: number;
}

interface SimpleSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

export function SimpleSearch({
  onSearch,
  placeholder = 'Search recipes...',
  className,
  showSuggestions = true,
}: SimpleSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const recentSearches = JSON.parse(
      localStorage.getItem('recentSearches') || '[]'
    );
    const popularSearches: SearchSuggestion[] = [
      { type: 'popular', query: 'pasta', count: 234 },
      { type: 'popular', query: 'chicken', count: 189 },
      { type: 'popular', query: 'vegetarian', count: 156 },
      { type: 'popular', query: 'dessert', count: 143 },
    ];

    setSuggestions([
      ...recentSearches
        .slice(0, 3)
        .map((q: string) => ({ type: 'recent' as const, query: q })),
      ...popularSearches,
    ]);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length > 1) {
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          // In a real implementation, this would fetch autocomplete suggestions
          // For now, we'll simulate with mock data
          const mockAutocomplete: SearchSuggestion[] = [
            { type: 'autocomplete', query: `${query} recipe` },
            { type: 'autocomplete', query: `${query} sauce` },
            { type: 'autocomplete', query: `${query} salad` },
          ];

          const recentSearches = JSON.parse(
            localStorage.getItem('recentSearches') || '[]'
          );
          const filteredRecent = recentSearches
            .filter((q: string) =>
              q.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 2)
            .map((q: string) => ({ type: 'recent' as const, query: q }));

          setSuggestions([...filteredRecent, ...mockAutocomplete]);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setLoading(false);
      // Show default suggestions when input is empty
      const recentSearches = JSON.parse(
        localStorage.getItem('recentSearches') || '[]'
      );
      const popularSearches: SearchSuggestion[] = [
        { type: 'popular', query: 'pasta', count: 234 },
        { type: 'popular', query: 'chicken', count: 189 },
        { type: 'popular', query: 'vegetarian', count: 156 },
      ];

      setSuggestions([
        ...recentSearches
          .slice(0, 3)
          .map((q: string) => ({ type: 'recent' as const, query: q })),
        ...popularSearches,
      ]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const saveRecentSearch = (searchQuery: string) => {
    const recentSearches = JSON.parse(
      localStorage.getItem('recentSearches') || '[]'
    );
    const updatedSearches = [
      searchQuery,
      ...recentSearches.filter((q: string) => q !== searchQuery),
    ].slice(0, 10); // Keep only 10 recent searches
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm.trim());
      onSearch?.(searchTerm);
      setShowDropdown(false);
      setSelectedIndex(-1);
      router.push(`/recipes?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showDropdown) {
      handleSearch();
      return;
    }

    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSearch(suggestions[selectedIndex].query);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.query);
    handleSearch(suggestion.query);
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="h-4 w-4" />;
      case 'popular':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('relative w-full max-w-lg', className)}>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => showSuggestions && setShowDropdown(true)}
          onBlur={() => {
            // Delay hiding dropdown to allow for click events
            setTimeout(() => setShowDropdown(false), 150);
          }}
          placeholder={placeholder}
          className="pr-10 pl-10"
          aria-label="Search recipes"
          autoComplete="off"
        />
        <div className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="hover:bg-muted h-8 w-8 p-0"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && showSuggestions && suggestions.length > 0 && (
        <div className="bg-background border-border absolute top-full z-50 mt-1 w-full rounded-md border shadow-lg">
          <div className="max-h-64 overflow-y-auto py-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.query}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'hover:bg-accent focus:bg-accent flex w-full items-center gap-3 px-3 py-2 text-left text-sm',
                  selectedIndex === index && 'bg-accent'
                )}
              >
                <span className="text-muted-foreground flex-shrink-0">
                  {getSuggestionIcon(suggestion.type)}
                </span>
                <span className="flex-1 truncate">{suggestion.query}</span>
                {suggestion.type === 'popular' && suggestion.count && (
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.count}
                  </Badge>
                )}
                {suggestion.type === 'recent' && (
                  <Badge variant="outline" className="text-xs">
                    Recent
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

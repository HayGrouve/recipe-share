'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SimpleSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleSearch({
  onSearch,
  placeholder = 'Search recipes...',
  className,
}: SimpleSearchProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (searchTerm.trim()) {
      onSearch?.(searchTerm);
      router.push(`/recipes?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn('relative w-full max-w-lg', className)}>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-10 pl-10"
          aria-label="Search recipes"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="hover:bg-muted absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

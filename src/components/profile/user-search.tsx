'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Users, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Skeleton } from '@/components/ui/skeleton-loader';
import { toast } from 'sonner';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  profileImageUrl?: string;
}

interface SearchResponse {
  users: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  searchTerm: string;
  note?: string;
}

export default function UserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    hasNextPage: false,
  });

  // Debounced search function
  const debounceSearch = useCallback(
    debounce((query: string) => {
      if (query.trim().length >= 2) {
        performSearch(query, 1);
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debounceSearch(searchQuery);
  }, [searchQuery, debounceSearch]);

  const performSearch = async (query: string, page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=10`
      );

      if (response.ok) {
        const data: SearchResponse = await response.json();
        setSearchResults(data.users);
        setPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          hasNextPage: data.pagination.hasNextPage,
        });
        setHasSearched(true);

        if (data.note) {
          toast.info(data.note);
        }
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreResults = () => {
    if (pagination.hasNextPage && !loading) {
      performSearch(searchQuery, pagination.page + 1);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Find Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search for users by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search Results */}
        {!loading && hasSearched && (
          <div className="space-y-3">
            {searchResults.length > 0 ? (
              <>
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <Link
                      href={`/profile/${user.id}`}
                      className="flex flex-1 items-center space-x-3"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={user.profileImageUrl}
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-muted-foreground text-sm">
                          View profile
                        </p>
                      </div>
                    </Link>
                    <Button size="sm" variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Follow
                    </Button>
                  </div>
                ))}

                {/* Load More Button */}
                {pagination.hasNextPage && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={loadMoreResults}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  {searchQuery.length < 2
                    ? 'Enter at least 2 characters to search'
                    : 'No users found matching your search'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="py-8 text-center">
            <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">
              Search for users to connect with
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Debounce utility function
function debounce(func: (query: string) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return (query: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(query), wait);
  };
}

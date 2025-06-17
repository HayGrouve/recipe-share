'use client';

import { useState, useEffect } from 'react';
import { Users, X, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton-loader';
import { toast } from 'sonner';
import Link from 'next/link';

interface FriendSuggestion {
  id: string;
  name: string;
  profileImageUrl?: string;
  mutualFriends?: number;
  score: number;
  reason: string;
}

interface SuggestionsResponse {
  suggestions: FriendSuggestion[];
  userId: string;
  limit: number;
  note?: string;
}

interface FriendSuggestionsProps {
  userId: string;
  limit?: number;
}

export default function FriendSuggestions({
  userId,
  limit = 5,
}: FriendSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissing, setDismissing] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [userId, limit]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/users/${userId}/suggestions?limit=${limit}`
      );

      if (response.ok) {
        const data: SuggestionsResponse = await response.json();
        setSuggestions(data.suggestions);

        if (data.note) {
          toast.info(data.note);
        }
      } else {
        console.error('Failed to load friend suggestions');
      }
    } catch (error) {
      console.error('Error loading friend suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissSuggestion = async (suggestedUserId: string) => {
    try {
      setDismissing(suggestedUserId);
      const response = await fetch(`/api/users/${userId}/suggestions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suggestedUserId,
          action: 'dismiss',
        }),
      });

      if (response.ok) {
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestedUserId));
        toast.success('Suggestion dismissed');
      } else {
        throw new Error('Failed to dismiss suggestion');
      }
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
      toast.error('Failed to dismiss suggestion');
    } finally {
      setDismissing(null);
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'mutual_follows':
        return 'Mutual connections';
      case 'similar_cuisine':
        return 'Similar taste';
      case 'similar_interests':
        return 'Similar interests';
      default:
        return 'Suggested for you';
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Suggested for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Suggested for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">
              No suggestions available right now
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Suggested for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between space-x-3"
            >
              <Link
                href={`/profile/${suggestion.id}`}
                className="flex min-w-0 flex-1 items-center space-x-3"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={suggestion.profileImageUrl}
                    alt={suggestion.name}
                  />
                  <AvatarFallback>
                    {getInitials(suggestion.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{suggestion.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getReasonText(suggestion.reason)}
                    </Badge>
                    {suggestion.mutualFriends &&
                      suggestion.mutualFriends > 0 && (
                        <span className="text-muted-foreground text-xs">
                          {suggestion.mutualFriends} mutual
                        </span>
                      )}
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline">
                  <UserPlus className="mr-1 h-4 w-4" />
                  Follow
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissSuggestion(suggestion.id)}
                  disabled={dismissing === suggestion.id}
                >
                  {dismissing === suggestion.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { Activity, ChefHat, Star, Loader2, Heart } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'recipe_created' | 'recipe_rated';
  userId: string;
  userName: string;
  userImage: string | null;
  createdAt: string;
  recipe?: {
    id: string;
    title: string;
    description: string | null;
  };
  rating?: {
    value: number;
    comment: string | null;
  };
}

interface ActivityFeedData {
  activities: ActivityItem[];
  hasMore: boolean;
  followingCount: number;
}

interface ActivityFeedProps {
  userId: string;
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const [feedData, setFeedData] = useState<ActivityFeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchActivityFeed();
  }, [userId]);

  const fetchActivityFeed = async (offset = 0) => {
    try {
      const response = await fetch(
        `/api/users/${userId}/activity-feed?limit=10&offset=${offset}`
      );
      const data = await response.json();

      if (data.success) {
        if (offset === 0) {
          setFeedData(data.data);
        } else {
          // Append to existing data
          setFeedData((prev) => {
            if (!prev) return data.data;

            return {
              ...data.data,
              activities: [...prev.activities, ...data.data.activities],
            };
          });
        }
      }
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (!feedData || loadingMore || !feedData.hasMore) return;

    setLoadingMore(true);
    await fetchActivityFeed(feedData.activities.length);
  };

  const getInitials = (name: string) => {
    return (
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!feedData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Failed to load activity feed</p>
        </CardContent>
      </Card>
    );
  }

  const ActivityItem = ({ activity }: { activity: ActivityItem }) => {
    const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
      addSuffix: true,
    });

    return (
      <div className="flex space-x-3 border-b p-4 last:border-b-0">
        <Link href={`/profile/${activity.userId}`}>
          <Avatar className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-80">
            <AvatarImage
              src={activity.userImage || ''}
              alt={activity.userName}
            />
            <AvatarFallback>{getInitials(activity.userName)}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center space-x-2">
            <Link
              href={`/profile/${activity.userId}`}
              className="truncate font-medium hover:underline"
            >
              {activity.userName}
            </Link>
            {activity.type === 'recipe_created' ? (
              <div className="flex items-center text-green-600">
                <ChefHat className="mr-1 h-4 w-4" />
                <span className="text-sm">created a recipe</span>
              </div>
            ) : (
              <div className="flex items-center text-blue-600">
                <Star className="mr-1 h-4 w-4" />
                <span className="text-sm">rated a recipe</span>
              </div>
            )}
            <span className="text-muted-foreground text-xs">{timeAgo}</span>
          </div>

          {activity.recipe && (
            <div className="bg-muted/30 mt-2 rounded-lg p-3">
              <Link
                href={`/recipes/${activity.recipe.id}`}
                className="hover:bg-muted/50 block rounded transition-colors"
              >
                <h4 className="mb-1 font-medium hover:underline">
                  {activity.recipe.title}
                </h4>
                {activity.recipe.description && (
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {activity.recipe.description}
                  </p>
                )}

                {activity.type === 'recipe_rated' && activity.rating && (
                  <div className="mt-2 flex items-center space-x-2">
                    <StarRating rating={activity.rating.value} size="sm" />
                    <span className="text-sm font-medium">
                      {activity.rating.value}/5
                    </span>
                    {activity.rating.comment && (
                      <span className="text-muted-foreground text-sm">
                        • &ldquo;{activity.rating.comment}&rdquo;
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Feed
          {feedData.followingCount > 0 && (
            <span className="text-muted-foreground text-sm font-normal">
              ({feedData.followingCount} following)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feedData.activities.length === 0 ? (
          <div className="py-8 text-center">
            {feedData.followingCount === 0 ? (
              <>
                <Heart className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground mb-2">
                  Follow some users to see their activity
                </p>
                <p className="text-muted-foreground text-sm">
                  Discover new recipes and connect with other food enthusiasts!
                </p>
              </>
            ) : (
              <>
                <Activity className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  No recent activity from people you follow
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-0 rounded-lg border">
            {feedData.activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}

            {feedData.hasMore && (
              <div className="p-4 text-center">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                  size="sm"
                >
                  {loadingMore ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

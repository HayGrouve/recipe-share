'use client';

import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  MessageCircle,
  Star,
  UserPlus,
  ChefHat,
  Clock,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ActivityUser {
  id: string;
  name: string;
  image: string;
}

interface ActivityTarget {
  id: string;
  type: 'recipe' | 'user' | 'collection';
  title: string;
}

interface Activity {
  id: number;
  type:
    | 'recipe_created'
    | 'recipe_rated'
    | 'recipe_commented'
    | 'user_followed'
    | 'recipe_saved';
  createdAt: Date;
  user: ActivityUser;
  target: ActivityTarget;
  metadata?: {
    rating?: number;
    comment?: string;
  };
}

interface ActivityFeedProps {
  userId?: string;
  className?: string;
}

const activityTypeConfig = {
  recipe_created: {
    icon: ChefHat,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    text: 'created a new recipe',
  },
  recipe_rated: {
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    text: 'rated a recipe',
  },
  recipe_commented: {
    icon: MessageCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    text: 'commented on a recipe',
  },
  user_followed: {
    icon: UserPlus,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    text: 'started following',
  },
  recipe_saved: {
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    text: 'saved a recipe',
  },
};

export function ActivityFeed({ userId, className }: ActivityFeedProps) {
  const { user } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(
    async (pageNum: number = 1, refresh: boolean = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else if (pageNum === 1) {
          setLoading(true);
        }

        const targetUserId = userId || user?.id;
        if (!targetUserId) return;

        const response = await fetch(
          `/api/users/${targetUserId}/activity-feed?page=${pageNum}&limit=20`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch activity feed');
        }

        const data = await response.json();

        // Convert string dates back to Date objects
        const formattedActivities = data.activities.map(
          (activity: Activity & { createdAt: string }) => ({
            ...activity,
            createdAt: new Date(activity.createdAt),
          })
        );

        if (pageNum === 1 || refresh) {
          setActivities(formattedActivities);
        } else {
          setActivities((prev) => [...prev, ...formattedActivities]);
        }

        setHasMore(data.pagination.hasMore);
        setError(null);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activity feed');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId, user?.id]
  );

  useEffect(() => {
    fetchActivities(1);
  }, [fetchActivities]);

  const handleRefresh = () => {
    setPage(1);
    fetchActivities(1, true);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage);
  };

  const getActivityDescription = (activity: Activity) => {
    const config = activityTypeConfig[activity.type];

    switch (activity.type) {
      case 'recipe_rated':
        const rating = activity.metadata?.rating || 0;
        return `${config.text} ${rating} star${rating !== 1 ? 's' : ''}`;
      case 'recipe_commented':
        return config.text;
      case 'user_followed':
        return config.text;
      default:
        return config.text;
    }
  };

  const getActivityLink = (activity: Activity) => {
    switch (activity.target.type) {
      case 'recipe':
        return `/recipes/${activity.target.id}`;
      case 'user':
        return `/profile/${activity.target.id}`;
      case 'collection':
        return `/collections/${activity.target.id}`;
      default:
        return '#';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-8 text-center ${className}`}>
        <div className="mb-4 text-gray-500">{error}</div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`py-8 text-center text-gray-500 ${className}`}>
        <ChefHat className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <p className="mb-2 text-lg font-medium">No activity yet</p>
        <p className="text-sm">
          Follow other users to see their cooking activities here
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Activity Feed</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {activities.map((activity) => {
        const config = activityTypeConfig[activity.type];
        const IconComponent = config.icon;

        return (
          <Card key={activity.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={activity.user.image}
                    alt={activity.user.name}
                  />
                  <AvatarFallback>
                    {activity.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <div className={`rounded-full p-1.5 ${config.bgColor}`}>
                      <IconComponent className={`h-3 w-3 ${config.color}`} />
                    </div>
                    <span className="font-medium">{activity.user.name}</span>
                    <span className="text-gray-500">
                      {getActivityDescription(activity)}
                    </span>
                  </div>

                  <Link
                    href={getActivityLink(activity)}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {activity.target.title}
                  </Link>

                  {activity.metadata?.comment && (
                    <div className="mt-2 rounded bg-gray-50 p-2 text-sm text-gray-700">
                      &ldquo;{activity.metadata.comment}&rdquo;
                    </div>
                  )}

                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDistanceToNow(activity.createdAt, {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {hasMore && (
        <div className="py-4 text-center">
          <Button onClick={handleLoadMore} variant="outline">
            Load More Activity
          </Button>
        </div>
      )}
    </div>
  );
}

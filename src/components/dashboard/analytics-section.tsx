'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Star,
  MessageCircle,
  Bookmark,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';

interface UserAnalytics {
  overview: {
    totalRecipes: number;
    publishedRecipes: number;
    draftRecipes: number;
    recipesLast30Days: number;
    recipesLast7Days: number;
  };
  engagement: {
    totalViews: number;
    totalRatings: number;
    totalComments: number;
    totalSaves: number;
    averageRating: number;
  };
  recentActivity: {
    recentRecipes: Array<{
      id: string;
      title: string;
      isPublished: boolean;
      createdAt: string;
      viewCount: number;
      ratingCount: number;
      saveCount: number;
    }>;
  };
  trends: {
    recipeCreationOverTime: Record<string, number>;
  };
}

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/user');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <Button onClick={fetchAnalytics} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGrowthTrend = (current: number, previous: number) => {
    if (previous === 0) return { trend: 'neutral', percentage: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change),
    };
  };

  const growth7to30 = getGrowthTrend(
    analytics.overview.recipesLast7Days,
    analytics.overview.recipesLast30Days - analytics.overview.recipesLast7Days
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <BarChart3 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.totalRecipes}
            </div>
            <p className="text-muted-foreground text-xs">
              {analytics.overview.publishedRecipes} published,{' '}
              {analytics.overview.draftRecipes} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.engagement.totalViews.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              Coming soon - view tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.engagement.averageRating > 0
                ? analytics.engagement.averageRating.toFixed(1)
                : '--'}
            </div>
            <p className="text-muted-foreground text-xs">
              {analytics.engagement.totalRatings} ratings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.recipesLast7Days}
            </div>
            <p className="text-muted-foreground flex items-center text-xs">
              recipes this week
              {growth7to30.trend === 'up' && (
                <ArrowUpRight className="ml-1 h-3 w-3 text-green-500" />
              )}
              {growth7to30.trend === 'down' && (
                <ArrowDownRight className="ml-1 h-3 w-3 text-red-500" />
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recipe Statistics</CardTitle>
                <CardDescription>Your recipe creation overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Published Recipes</span>
                  <Badge variant="default">
                    {analytics.overview.publishedRecipes}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Draft Recipes</span>
                  <Badge variant="secondary">
                    {analytics.overview.draftRecipes}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last 30 Days</span>
                  <Badge variant="outline">
                    {analytics.overview.recipesLast30Days}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last 7 Days</span>
                  <Badge variant="outline">
                    {analytics.overview.recipesLast7Days}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Coming soon - detailed performance analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-muted-foreground py-8 text-center">
                  <TrendingUp className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>
                    Performance metrics will be available once view tracking and
                    engagement features are implemented.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Comments
                </CardTitle>
                <MessageCircle className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.engagement.totalComments}
                </div>
                <p className="text-muted-foreground text-xs">
                  Coming soon - comment system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Saves
                </CardTitle>
                <Bookmark className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.engagement.totalSaves}
                </div>
                <p className="text-muted-foreground text-xs">
                  Coming soon - save feature
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Ratings
                </CardTitle>
                <Star className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.engagement.totalRatings}
                </div>
                <p className="text-muted-foreground text-xs">
                  Coming soon - rating system
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Creation Trends</CardTitle>
              <CardDescription>
                Your recipe creation pattern over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(analytics.trends.recipeCreationOverTime).length >
              0 ? (
                <div className="space-y-2">
                  {Object.entries(analytics.trends.recipeCreationOverTime)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 12)
                    .map(([month, count]) => (
                      <div
                        key={month}
                        className="flex items-center justify-between"
                      >
                        <span>
                          {new Date(month + '-01').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                          })}
                        </span>
                        <Badge variant="outline">
                          {count} {count === 1 ? 'recipe' : 'recipes'}
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <BarChart3 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>No recipes created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Recipes</CardTitle>
              <CardDescription>Your latest recipe activity</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recentActivity.recentRecipes.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentActivity.recentRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <h4 className="font-medium">{recipe.title}</h4>
                        <p className="text-muted-foreground text-sm">
                          Created {formatDate(recipe.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={recipe.isPublished ? 'default' : 'secondary'}
                        >
                          {recipe.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <div className="text-muted-foreground text-sm">
                          {recipe.viewCount} views
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <Calendar className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

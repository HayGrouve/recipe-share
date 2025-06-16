import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton-loader';
import { FollowButton } from '@/components/ui/follow-button';
import { UserConnections } from '@/components/profile/user-connections';
import { ActivityFeed } from '@/components/profile/activity-feed';
import { SavedRecipes } from '@/components/profile/saved-recipes';

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
}

interface PageProps {
  params: Promise<{ userId: string }>;
}

async function ProfileContent({ userId }: { userId: string }) {
  // Fetch user profile data from API
  let userProfile = null;

  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users/${userId}`,
      {
        cache: 'no-store',
      }
    );

    if (response.ok) {
      userProfile = await response.json();
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }

  const stats = userProfile?.stats || {
    recipeCount: 0,
    collectionCount: 0,
    likesCount: 0,
    reviewsCount: 0,
    followersCount: 0,
    followingCount: 0,
  };

  const recentRecipes = userProfile?.recentRecipes || [];
  const userName =
    userProfile?.firstName || userProfile?.lastName
      ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
      : userProfile?.username || 'Anonymous User';

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-8">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600">
              <span className="text-2xl font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{userName}</h1>
                  <p className="text-muted-foreground">
                    {userProfile?.username && `@${userProfile.username}`}
                  </p>
                  {userProfile?.bio && (
                    <p className="text-muted-foreground mt-2">
                      {userProfile.bio}
                    </p>
                  )}
                </div>
                <FollowButton targetUserId={userId} targetUserName={userName} />
              </div>
              <div className="flex gap-2">
                <Card className="px-4 py-2">
                  <span className="text-sm font-medium">Following</span>
                  <p className="text-2xl font-bold">{stats.followingCount}</p>
                </Card>
                <Card className="px-4 py-2">
                  <span className="text-sm font-medium">Followers</span>
                  <p className="text-2xl font-bold">{stats.followersCount}</p>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="p-4">
            <span className="text-muted-foreground text-sm font-medium">
              Recipes
            </span>
            <p className="text-2xl font-bold">{stats.recipeCount}</p>
          </Card>
          <Card className="p-4">
            <span className="text-muted-foreground text-sm font-medium">
              Collections
            </span>
            <p className="text-2xl font-bold">{stats.collectionCount}</p>
          </Card>
          <Card className="p-4">
            <span className="text-muted-foreground text-sm font-medium">
              Likes
            </span>
            <p className="text-2xl font-bold">{stats.likesCount}</p>
          </Card>
          <Card className="p-4">
            <span className="text-muted-foreground text-sm font-medium">
              Reviews
            </span>
            <p className="text-2xl font-bold">{stats.reviewsCount}</p>
          </Card>
        </div>

        {/* Profile Content Tabs */}
        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="mt-6">
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Recent Recipes</h3>
              {recentRecipes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentRecipes.map((recipe: Recipe) => (
                    <Card key={recipe.id} className="p-4">
                      <h4 className="mb-2 text-lg font-semibold">
                        {recipe.title}
                      </h4>
                      {recipe.description && (
                        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                          {recipe.description}
                        </p>
                      )}
                      <div className="text-muted-foreground flex items-center justify-between text-xs">
                        <span
                          className={`rounded-full px-2 py-1 ${recipe.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                        >
                          {recipe.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span>
                          {new Date(recipe.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recipes yet...</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <SavedRecipes userId={userId} />
          </TabsContent>

          <TabsContent value="collections" className="mt-6">
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Collections</h3>
              <p className="text-muted-foreground">No collections yet...</p>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="mt-6">
            <UserConnections userId={userId} />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <ActivityFeed userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-16 w-24" />
                <Skeleton className="h-16 w-24" />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="mb-2 h-4 w-16" />
              <Skeleton className="h-8 w-12" />
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <Card className="p-6">
          <Skeleton className="h-96 w-full" />
        </Card>
      </div>
    </div>
  );
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { userId } = await params;

  if (!userId) {
    notFound();
  }

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent userId={userId} />
    </Suspense>
  );
}

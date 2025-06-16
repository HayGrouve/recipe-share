import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share, Eye, Edit, Clock, AlertCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ token: string }>;
}

async function SharedCollectionContent({ token }: { token: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/collections/shared/${token}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error('Failed to load shared collection');
    }

    const data = await response.json();

    if (!data.success) {
      return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-amber-800">
                  Feature Coming Soon
                </CardTitle>
              </div>
              <CardDescription className="text-amber-700">
                Collection sharing is currently in development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-amber-800">
                {data.message ||
                  'This feature requires additional database schema changes to be fully functional.'}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const { collection } = data;

    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Collection Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-lg text-gray-600">
                  {collection.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Share className="h-3 w-3" />
                Shared Collection
              </Badge>
              <Badge
                variant={
                  collection.permission === 'edit' ? 'default' : 'secondary'
                }
                className="flex items-center gap-1"
              >
                {collection.permission === 'edit' ? (
                  <Edit className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
                {collection.permission === 'edit' ? 'Can Edit' : 'View Only'}
              </Badge>
            </div>
          </div>

          {/* Collection Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Shared{' '}
              {new Date(collection.sharedAt || Date.now()).toLocaleDateString()}
            </span>
            <span>{collection.recipes?.length || 0} recipes</span>
          </div>
        </div>

        {/* Recipes Grid */}
        {collection.recipes && collection.recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collection.recipes.map(
              (recipe: {
                id: string;
                title: string;
                description?: string;
                prepTime?: number;
                cookTime?: number;
                difficulty?: string;
              }) => (
                <Card
                  key={recipe.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-lg">
                      {recipe.title}
                    </CardTitle>
                    {recipe.description && (
                      <CardDescription className="line-clamp-2">
                        {recipe.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
                      {recipe.prepTime && (
                        <span>{recipe.prepTime} min prep</span>
                      )}
                      {recipe.cookTime && (
                        <span>{recipe.cookTime} min cook</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {recipe.difficulty || 'Medium'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        View Recipe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="mb-4 text-gray-500">
                This collection doesn&apos;t have any recipes yet.
              </p>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error loading shared collection:', error);
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">
              Error Loading Collection
            </CardTitle>
            <CardDescription className="text-red-700">
              There was a problem loading the shared collection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

function LoadingState() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-8 w-1/2 rounded-md bg-gray-200"></div>
          <div className="h-4 w-3/4 rounded-md bg-gray-200"></div>
          <div className="h-4 w-1/4 rounded-md bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 rounded-md bg-gray-200"></div>
                <div className="h-4 w-3/4 rounded-md bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-1/2 rounded-md bg-gray-200"></div>
                  <div className="h-8 w-1/3 rounded-md bg-gray-200"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function SharedCollectionPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingState />}>
        <SharedCollectionContent token={token} />
      </Suspense>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { WifiOff, RefreshCw, ChefHat, Heart, Book } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <WifiOff className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            You&apos;re Offline
          </CardTitle>
          <CardDescription className="text-gray-600">
            It looks like you&apos;ve lost your internet connection. Don&apos;t
            worry – you can still browse cached recipes and content.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-3">
              <Book className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-green-900">Cached Recipes</p>
                <p className="text-sm text-green-700">
                  Previously viewed recipes are still available
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-3">
              <Heart className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Saved Collections</p>
                <p className="text-sm text-blue-700">
                  Your saved recipes remain accessible
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 rounded-lg bg-purple-50 p-3">
              <ChefHat className="h-5 w-5 text-purple-600" />
              <div className="text-left">
                <p className="font-medium text-purple-900">Cooking Mode</p>
                <p className="text-sm text-purple-700">
                  Continue following recipe instructions
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              Go to Homepage
            </Button>
          </Link>

          <p className="mt-4 text-xs text-gray-500">
            Recipe Share works offline to help you cook without interruption
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Static generation for better offline support
export const dynamic = 'force-static';

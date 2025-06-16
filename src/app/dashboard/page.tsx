import { Metadata } from 'next';
import { Suspense } from 'react';
import { RecipeDashboard } from '@/components/dashboard/recipe-dashboard';

export const metadata: Metadata = {
  title: 'My Recipe Dashboard | Recipe Share',
  description:
    'Manage your personal recipes, collections, and cooking statistics',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Recipe Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your recipes, organize collections, and track your cooking
            journey
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <RecipeDashboard />
        </Suspense>
      </div>
    </div>
  );
}

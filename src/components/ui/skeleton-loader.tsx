import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

export function RecipeCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Image skeleton */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* Content area */}
      <div className="space-y-2">
        {/* Category badge and difficulty */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Description */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Rating and stats */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Time and servings */}
        <div className="flex items-center justify-between text-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Author */}
        <div className="flex items-center space-x-2 pt-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 pt-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3">
          <Skeleton className="h-8 w-16" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecipeCardSkeletonGrid({
  count = 12,
  viewMode = 'grid',
}: {
  count?: number;
  viewMode?: 'grid' | 'list';
}) {
  return (
    <div
      className={`grid gap-6 ${
        viewMode === 'grid'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'mx-auto max-w-4xl grid-cols-1'
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton
          key={i}
          className={viewMode === 'list' ? 'flex space-y-0 space-x-4' : ''}
        />
      ))}
    </div>
  );
}

export function FilterPanelSkeleton() {
  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchHeaderSkeleton() {
  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

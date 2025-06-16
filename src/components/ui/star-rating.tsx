'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating?: number;
  totalStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  showValue?: boolean;
}

export function StarRating({
  rating = 0,
  totalStars = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className,
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const currentRating = interactive ? hoverRating || selectedRating : rating;

  const handleStarClick = (starValue: number) => {
    if (!interactive) return;
    setSelectedRating(starValue);
    onRatingChange?.(starValue);
  };

  const handleStarHover = (starValue: number) => {
    if (!interactive) return;
    setHoverRating(starValue);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(0);
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center" onMouseLeave={handleMouseLeave}>
        {Array.from({ length: totalStars }, (_, index) => {
          const starValue = index + 1;
          const isFilled = currentRating >= starValue;
          const isHalfFilled =
            currentRating >= starValue - 0.5 && currentRating < starValue;

          return (
            <button
              key={index}
              type="button"
              className={cn(
                'transition-all duration-150',
                interactive && 'cursor-pointer hover:scale-110',
                !interactive && 'cursor-default'
              )}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              disabled={!interactive}
            >
              <svg
                className={cn(
                  sizeClasses[size],
                  'transition-colors duration-150',
                  isFilled
                    ? 'fill-current text-yellow-400'
                    : isHalfFilled
                      ? 'text-yellow-400'
                      : interactive && hoverRating >= starValue
                        ? 'fill-current text-yellow-300'
                        : 'text-gray-300'
                )}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                {isHalfFilled ? (
                  <>
                    <defs>
                      <linearGradient
                        id={`half-${index}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="50%" stopColor="currentColor" />
                        <stop offset="50%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      fill={`url(#half-${index})`}
                    />
                  </>
                ) : (
                  <path
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    fill={isFilled ? 'currentColor' : 'none'}
                  />
                )}
              </svg>
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-muted-foreground ml-2 text-sm">
          {currentRating.toFixed(1)} / {totalStars}
        </span>
      )}
    </div>
  );
}

// Component for showing rating distribution
interface RatingDistributionProps {
  distribution: Record<number, number>;
  totalRatings: number;
  className?: string;
}

export function RatingDistribution({
  distribution,
  totalRatings,
  className,
}: RatingDistributionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution[stars] || 0;
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

        return (
          <div key={stars} className="flex items-center gap-3 text-sm">
            <div className="flex w-12 items-center gap-1">
              <span className="text-muted-foreground">{stars}</span>
              <StarRating rating={1} totalStars={1} size="sm" />
            </div>
            <div className="h-2 flex-1 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-muted-foreground w-8 text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

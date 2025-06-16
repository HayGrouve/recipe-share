'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating, RatingDistribution } from '@/components/ui/star-rating';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User } from 'lucide-react';

interface RatingData {
  averageRating: number;
  totalRatings: number;
  distribution: Record<number, number>;
  userRating: {
    rating: number;
    comment: string | null;
    createdAt: string;
  } | null;
}

interface RecipeRatingProps {
  recipeId: string;
  className?: string;
}

export function RecipeRating({ recipeId, className }: RecipeRatingProps) {
  const { isSignedIn } = useUser();
  const { toast } = useToast();

  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');

  // Fetch rating data
  useEffect(() => {
    fetchRatingData();
  }, [recipeId]);

  const fetchRatingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recipes/${recipeId}/rating`);

      if (response.ok) {
        const result = await response.json();
        setRatingData(result.data);

        // Pre-fill form if user already rated
        if (result.data.userRating) {
          setSelectedRating(result.data.userRating.rating);
          setComment(result.data.userRating.comment || '');
        }
      }
    } catch (error) {
      console.error('Error fetching rating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!isSignedIn) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to rate this recipe.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedRating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/recipes/${recipeId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: selectedRating,
          comment: comment.trim() || null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Rating submitted',
          description: result.message,
        });
        setShowRatingForm(false);
        await fetchRatingData(); // Refresh rating data
      } else {
        throw new Error(result.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to submit rating',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // const handleEditRating = () => {
  //   setShowRatingForm(true);
  // };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ratingData) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recipe Rating</span>
          {isSignedIn && !showRatingForm && (
            <Button
              variant={ratingData.userRating ? 'outline' : 'default'}
              size="sm"
              onClick={() => setShowRatingForm(true)}
            >
              {ratingData.userRating ? 'Edit Rating' : 'Rate Recipe'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Rating Summary */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">
              {ratingData.averageRating.toFixed(1)}
            </div>
            <StarRating
              rating={ratingData.averageRating}
              size="lg"
              showValue={false}
            />
            <div className="text-muted-foreground mt-1 text-sm">
              {ratingData.totalRatings}{' '}
              {ratingData.totalRatings === 1 ? 'rating' : 'ratings'}
            </div>
          </div>

          {ratingData.totalRatings > 0 && (
            <div className="flex-1">
              <RatingDistribution
                distribution={ratingData.distribution}
                totalRatings={ratingData.totalRatings}
              />
            </div>
          )}
        </div>

        {/* User's Current Rating */}
        {ratingData.userRating && !showRatingForm && (
          <div className="border-t pt-4">
            <div className="mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Your Rating</span>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <StarRating rating={ratingData.userRating.rating} size="sm" />
              <span className="text-muted-foreground text-sm">
                {ratingData.userRating.rating}/5
              </span>
            </div>
            {ratingData.userRating.comment && (
              <p className="bg-muted rounded-md p-3 text-sm">
                {ratingData.userRating.comment}
              </p>
            )}
          </div>
        )}

        {/* Rating Form */}
        {showRatingForm && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Your Rating
              </label>
              <StarRating
                rating={selectedRating}
                interactive
                size="lg"
                onRatingChange={setSelectedRating}
                showValue
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Comment (optional)
              </label>
              <Textarea
                placeholder="Share your thoughts about this recipe..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={3}
              />
              <div className="text-muted-foreground mt-1 text-xs">
                {comment.length}/1000 characters
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitRating}
                disabled={submitting || selectedRating === 0}
                className="flex-1"
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {ratingData.userRating ? 'Update Rating' : 'Submit Rating'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRatingForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* No ratings yet */}
        {ratingData.totalRatings === 0 && (
          <div className="text-muted-foreground py-6 text-center">
            <p>No ratings yet. Be the first to rate this recipe!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

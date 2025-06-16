'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

interface SaveButtonProps {
  recipeId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
  showText?: boolean;
}

export function SaveButton({
  recipeId,
  size = 'default',
  variant = 'outline',
  className,
  showText = false,
}: SaveButtonProps) {
  const { user, isLoaded: userLoaded } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if recipe is saved on mount
  useEffect(() => {
    async function checkSaveStatus() {
      if (!userLoaded) return;

      setIsChecking(true);
      try {
        const response = await fetch(`/api/recipes/${recipeId}/save`);
        const data = await response.json();

        if (data.success) {
          setIsSaved(data.data.isSaved);
        }
      } catch (error) {
        console.error('Error checking save status:', error);
      } finally {
        setIsChecking(false);
      }
    }

    checkSaveStatus();
  }, [recipeId, userLoaded]);

  const handleToggleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save recipes');
      return;
    }

    setIsLoading(true);
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const response = await fetch(`/api/recipes/${recipeId}/save`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Recipe removed from saved' : 'Recipe saved!');
      } else {
        toast.error(data.error || 'Failed to update save status');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userLoaded || isChecking) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('gap-2', className)}
        disabled
      >
        <Bookmark
          className={cn(
            'transition-colors',
            size === 'sm' && 'h-3 w-3',
            size === 'default' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5'
          )}
        />
        {showText && 'Save'}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('gap-2', className)}
      onClick={handleToggleSave}
      disabled={isLoading || !user}
    >
      {isSaved ? (
        <BookmarkCheck
          className={cn(
            'text-blue-600 transition-colors',
            size === 'sm' && 'h-3 w-3',
            size === 'default' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5'
          )}
        />
      ) : (
        <Bookmark
          className={cn(
            'transition-colors',
            size === 'sm' && 'h-3 w-3',
            size === 'default' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5'
          )}
        />
      )}
      {showText && (isSaved ? 'Saved' : 'Save')}
    </Button>
  );
}

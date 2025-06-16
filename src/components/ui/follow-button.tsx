'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface FollowButtonProps {
  targetUserId: string;
  targetUserName?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function FollowButton({
  targetUserId,
  targetUserName = 'User',
  className,
  variant = 'default',
  size = 'default',
}: FollowButtonProps) {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [canFollow, setCanFollow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check follow status on mount
  useEffect(() => {
    checkFollowStatus();
  }, [targetUserId, user]);

  const checkFollowStatus = async () => {
    if (!targetUserId) return;

    try {
      setChecking(true);
      const response = await fetch(`/api/users/${targetUserId}/follow`);
      const data = await response.json();

      if (data.success) {
        setIsFollowing(data.data.isFollowing);
        setCanFollow(data.data.canFollow);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !canFollow || loading) return;

    setLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${targetUserId}/follow`, {
        method,
      });

      const data = await response.json();

      if (data.success) {
        setIsFollowing(!isFollowing);
        toast.success(
          isFollowing
            ? `Unfollowed ${targetUserName}`
            : `Now following ${targetUserName}`
        );
      } else {
        toast.error(data.error || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if user can't follow (not logged in or same user)
  if (checking) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!canFollow) {
    return null;
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={loading}
      variant={isFollowing ? 'outline' : variant}
      size={size}
      className={className}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="mr-2 h-4 w-4" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
}

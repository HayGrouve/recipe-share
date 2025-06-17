'use client';

import { useState, useEffect } from 'react';
import { UserX, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface BlockButtonProps {
  userId: string;
  userName: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

export default function BlockButton({
  userId,
  userName,
  size = 'default',
  variant = 'outline',
}: BlockButtonProps) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkBlockStatus();
  }, [userId]);

  const checkBlockStatus = async () => {
    try {
      setChecking(true);
      const response = await fetch(`/api/users/${userId}/block`);

      if (response.ok) {
        const data = await response.json();
        setIsBlocked(data.isBlocked);
      }
    } catch (error) {
      console.error('Error checking block status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleBlock = async (reason?: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'User blocked',
        }),
      });

      if (response.ok) {
        setIsBlocked(true);
        toast.success(`${userName} has been blocked`);
      } else {
        throw new Error('Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/block`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsBlocked(false);
        toast.success(`${userName} has been unblocked`);
      } else {
        throw new Error('Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button size={size} variant={variant} disabled>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </Button>
    );
  }

  if (isBlocked) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size={size} variant="secondary" disabled={loading}>
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Blocked
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will allow {userName} to see your profile and interact with
              you again. You can block them again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock}>
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={size} variant={variant} disabled={loading}>
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Block
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block {userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will prevent {userName} from:
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Seeing your profile and recipes</li>
              <li>Following you or sending follow requests</li>
              <li>Commenting on your recipes</li>
              <li>Finding you in search results</li>
            </ul>
            <br />
            {userName} will not be notified that they have been blocked. You can
            unblock them at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleBlock()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Block User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

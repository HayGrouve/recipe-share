'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Check,
  X,
  MessageCircle,
  Star,
  UserPlus,
  ChefHat,
  Clock,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { announce } from '@/lib/focus-management';

interface NotificationUser {
  id: string;
  name: string;
  image: string;
}

interface NotificationTarget {
  id: string;
  type: 'recipe' | 'user' | 'collection';
  title?: string;
}

interface Notification {
  id: number;
  type: 'new_follower' | 'recipe_comment' | 'recipe_rating' | 'friend_activity';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl: string;
  triggerUser: NotificationUser;
  target: NotificationTarget;
  createdAt: Date;
}

interface NotificationsProps {
  userId?: string;
  className?: string;
  unreadOnly?: boolean;
}

const notificationTypeConfig = {
  new_follower: {
    icon: UserPlus,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    ariaLabel: 'New follower notification',
  },
  recipe_comment: {
    icon: MessageCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    ariaLabel: 'Recipe comment notification',
  },
  recipe_rating: {
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    ariaLabel: 'Recipe rating notification',
  },
  friend_activity: {
    icon: ChefHat,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    ariaLabel: 'Friend activity notification',
  },
};

export function Notifications({
  userId,
  className,
  unreadOnly = false,
}: NotificationsProps) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const response = await fetch(
        `/api/users/${targetUserId}/notifications?page=${pageNum}&limit=20&unreadOnly=${unreadOnly}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      // Convert string dates back to Date objects
      const formattedNotifications = data.notifications.map(
        (notification: Notification & { createdAt: string }) => ({
          ...notification,
          createdAt: new Date(notification.createdAt),
        })
      );

      if (pageNum === 1) {
        setNotifications(formattedNotifications);
      } else {
        setNotifications((prev) => [...prev, ...formattedNotifications]);
      }

      setHasMore(data.pagination.hasMore);
      setUnreadCount(data.unreadCount);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [userId, user?.id, unreadOnly]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const response = await fetch(`/api/users/${targetUserId}/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          action: 'mark_read',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Announce to screen readers
      announce('Notification marked as read');
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      announce('Failed to mark notification as read');
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const response = await fetch(`/api/users/${targetUserId}/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: 'all',
          action: 'mark_all_read',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      // Announce to screen readers
      announce(`All ${notifications.length} notifications marked as read`);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      announce('Failed to mark all notifications as read');
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const response = await fetch(`/api/users/${targetUserId}/notifications`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update local state
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Announce to screen readers
      announce('Notification deleted');
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      announce('Failed to delete notification');
      toast.error('Failed to delete notification');
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
    announce(`Loading more notifications, page ${nextPage}`);
  };

  if (loading) {
    return (
      <div
        className={`space-y-4 ${className}`}
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Loading notifications...</span>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4" aria-hidden="true">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-8 text-center ${className}`} role="alert">
        <div className="mb-4 text-gray-500">{error}</div>
        <Button
          onClick={() => fetchNotifications(1)}
          variant="outline"
          aria-label="Retry loading notifications"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div
        className={`py-8 text-center text-gray-500 ${className}`}
        role="status"
      >
        <Bell
          className="mx-auto mb-4 h-12 w-12 text-gray-300"
          aria-hidden="true"
        />
        <p className="mb-2 text-lg font-medium">
          {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
        </p>
        <p className="text-sm">
          You&apos;ll see notifications for new followers, comments, and ratings
          here
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Notifications Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold" id="notifications-heading">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="px-2 py-1"
              aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            size="sm"
            aria-label={`Mark all ${unreadCount} notifications as read`}
          >
            <Check className="mr-2 h-4 w-4" aria-hidden="true" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div
        role="region"
        aria-labelledby="notifications-heading"
        aria-live="polite"
        aria-describedby="notifications-description"
      >
        <div id="notifications-description" className="sr-only">
          {notifications.length} notification
          {notifications.length !== 1 ? 's' : ''} total,
          {unreadCount} unread. Use tab and arrow keys to navigate.
        </div>

        {notifications.map((notification) => {
          const config = notificationTypeConfig[notification.type];
          const IconComponent = config.icon;
          const isUnread = !notification.isRead;

          return (
            <article
              key={notification.id}
              className={`transition-shadow hover:shadow-md ${
                isUnread ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}
              role="article"
              aria-labelledby={`notification-${notification.id}-title`}
              aria-describedby={`notification-${notification.id}-content`}
              tabIndex={0}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={notification.triggerUser.image}
                        alt=""
                      />
                      <AvatarFallback>
                        {notification.triggerUser.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="mb-1 flex items-center space-x-2">
                          <div
                            className={`rounded-full p-1.5 ${config.bgColor}`}
                            role="img"
                            aria-label={config.ariaLabel}
                          >
                            <IconComponent
                              className={`h-3 w-3 ${config.color}`}
                              aria-hidden="true"
                            />
                          </div>
                          <span
                            className="text-sm font-medium"
                            id={`notification-${notification.id}-title`}
                          >
                            {notification.title}
                          </span>
                          {isUnread && (
                            <div
                              className="h-2 w-2 rounded-full bg-blue-500"
                              role="img"
                              aria-label="Unread notification"
                            />
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              aria-label={`More actions for notification from ${notification.triggerUser.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isUnread && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                              >
                                <Check
                                  className="mr-2 h-4 w-4"
                                  aria-hidden="true"
                                />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(notification.id)}
                              className="text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" aria-hidden="true" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div id={`notification-${notification.id}-content`}>
                        <p className="mb-2 text-sm text-gray-600">
                          <span className="sr-only">
                            Notification from {notification.triggerUser.name}:
                          </span>
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock
                              className="mr-1 h-3 w-3"
                              aria-hidden="true"
                            />
                            <time
                              dateTime={notification.createdAt.toISOString()}
                            >
                              {formatDistanceToNow(notification.createdAt, {
                                addSuffix: true,
                              })}
                            </time>
                          </div>

                          <Link
                            href={notification.actionUrl}
                            className="rounded-sm text-sm font-medium text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                            aria-label={`View ${notification.type.replace('_', ' ')} from ${notification.triggerUser.name}`}
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </article>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="py-4 text-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            aria-label="Load more notifications"
            aria-describedby="load-more-description"
          >
            <Loader2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Load More
          </Button>
          <div id="load-more-description" className="sr-only">
            Currently showing {notifications.length} of all notifications
          </div>
        </div>
      )}

      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" />
    </div>
  );
}

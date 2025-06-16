'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FollowButton } from '@/components/ui/follow-button';
import { Loader2, Users, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface UserConnection {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  profileImageUrl: string | null;
  followedAt: string;
}

interface ConnectionsData {
  followers: UserConnection[];
  following: UserConnection[];
  counts: {
    followers: number;
    following: number;
  };
  pagination: {
    limit: number;
    offset: number;
    hasMore: {
      followers: boolean;
      following: boolean;
    };
  };
}

interface UserConnectionsProps {
  userId: string;
}

export function UserConnections({ userId }: UserConnectionsProps) {
  const [connectionsData, setConnectionsData] =
    useState<ConnectionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    'followers'
  );
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, [userId]);

  const fetchConnections = async (
    type: 'both' | 'followers' | 'following' = 'both',
    offset = 0
  ) => {
    try {
      const response = await fetch(
        `/api/users/${userId}/connections?type=${type}&limit=20&offset=${offset}`
      );
      const data = await response.json();

      if (data.success) {
        if (offset === 0) {
          setConnectionsData(data.data);
        } else {
          // Append to existing data
          setConnectionsData((prev) => {
            if (!prev) return data.data;

            return {
              ...data.data,
              followers:
                type === 'followers' || type === 'both'
                  ? [...prev.followers, ...data.data.followers]
                  : prev.followers,
              following:
                type === 'following' || type === 'both'
                  ? [...prev.following, ...data.data.following]
                  : prev.following,
            };
          });
        }
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (!connectionsData || loadingMore) return;

    setLoadingMore(true);
    const currentList =
      activeTab === 'followers'
        ? connectionsData.followers
        : connectionsData.following;

    await fetchConnections(activeTab, currentList.length);
  };

  const getDisplayName = (user: UserConnection) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username || 'Anonymous User';
  };

  const getInitials = (user: UserConnection) => {
    const name = getDisplayName(user);
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!connectionsData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Failed to load connections</p>
        </CardContent>
      </Card>
    );
  }

  const UserConnectionItem = ({ user }: { user: UserConnection }) => (
    <div className="flex items-center justify-between border-b p-4 last:border-b-0">
      <div className="flex items-center space-x-3">
        <Link href={`/profile/${user.id}`}>
          <Avatar className="h-12 w-12 cursor-pointer transition-opacity hover:opacity-80">
            <AvatarImage
              src={user.profileImageUrl || ''}
              alt={getDisplayName(user)}
            />
            <AvatarFallback>{getInitials(user)}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link
            href={`/profile/${user.id}`}
            className="font-medium hover:underline"
          >
            {getDisplayName(user)}
          </Link>
          {user.username && (
            <p className="text-muted-foreground text-sm">@{user.username}</p>
          )}
          <p className="text-muted-foreground text-xs">
            Followed{' '}
            {formatDistanceToNow(new Date(user.followedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      <FollowButton
        targetUserId={user.id}
        targetUserName={getDisplayName(user)}
        size="sm"
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as 'followers' | 'following')
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Followers ({connectionsData.counts.followers})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Following ({connectionsData.counts.following})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-4">
            {connectionsData.followers.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">No followers yet</p>
              </div>
            ) : (
              <div className="space-y-0 rounded-lg border">
                {connectionsData.followers.map((user) => (
                  <UserConnectionItem key={user.id} user={user} />
                ))}
                {connectionsData.pagination.hasMore.followers && (
                  <div className="p-4 text-center">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      variant="outline"
                      size="sm"
                    >
                      {loadingMore ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            {connectionsData.following.length === 0 ? (
              <div className="py-8 text-center">
                <UserCheck className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  Not following anyone yet
                </p>
              </div>
            ) : (
              <div className="space-y-0 rounded-lg border">
                {connectionsData.following.map((user) => (
                  <UserConnectionItem key={user.id} user={user} />
                ))}
                {connectionsData.pagination.hasMore.following && (
                  <div className="p-4 text-center">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      variant="outline"
                      size="sm"
                    >
                      {loadingMore ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

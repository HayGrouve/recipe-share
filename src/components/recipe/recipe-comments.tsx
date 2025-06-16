'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, MessageCircle, Send } from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface CommentsData {
  comments: Comment[];
  total: number;
}

interface RecipeCommentsProps {
  recipeId: string;
  className?: string;
}

export function RecipeComments({ recipeId, className }: RecipeCommentsProps) {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();

  const [commentsData, setCommentsData] = useState<CommentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Fetch comments data
  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recipes/${recipeId}/comments`);

      if (response.ok) {
        const result = await response.json();
        setCommentsData(result.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!isSignedIn) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to comment on this recipe.',
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Comment required',
        description: 'Please enter a comment.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Comment posted',
          description: result.message,
        });
        setNewComment('');
        setShowCommentForm(false);
        await fetchComments(); // Refresh comments
      } else {
        throw new Error(result.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCommentDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>Comments ({commentsData?.total || 0})</span>
          </div>
          {isSignedIn && !showCommentForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCommentForm(true)}
            >
              Add Comment
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Comment Form */}
        {showCommentForm && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>
                  {user?.firstName
                    ? getInitials(`${user.firstName} ${user.lastName || ''}`)
                    : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Share your thoughts about this recipe..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={1000}
                  rows={3}
                />
                <div className="text-muted-foreground text-xs">
                  {newComment.length}/1000 characters
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCommentForm(false);
                  setNewComment('');
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Send className="mr-2 h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        {commentsData && commentsData.comments.length > 0 ? (
          <div className="space-y-4">
            {commentsData.comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatar || undefined} />
                  <AvatarFallback>
                    {getInitials(comment.author.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.author.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatCommentDate(comment.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-center">
            <MessageCircle className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

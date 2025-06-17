'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import {
  Star,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Heart,
  HeartHandshake,
  Share2,
  Flag,
  Send,
  Edit3,
  Trash2,
  Reply,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  dislikes: number;
  replies?: Comment[];
  isEdited?: boolean;
}

interface UserInteraction {
  isSaved: boolean;
  isLiked: boolean;
  userRating?: number;
}

interface RecipeInteractionsProps {
  averageRating: number;
  totalRatings: number;
  totalSaves: number;
  totalLikes: number;
  comments: Comment[];
  userInteraction: UserInteraction;
  onRate: (rating: number, comment?: string) => void;
  onComment: (content: string, parentId?: string) => void;
  onSave: () => void;
  onLike: () => void;
  onShare: () => void;
  className?: string;
}

const StarRating = ({
  rating,
  size = 'md',
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (interactive ? hoverRating || rating : rating);
        return (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''}`}
            onClick={interactive ? () => onRate?.(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        );
      })}
    </div>
  );
};

const CommentItem = ({
  comment,
  onReply,
  onLike,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  onReply: (parentId: string, content: string) => void;
  onLike: (commentId: string, type: 'like' | 'dislike') => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
}) => {
  const { user } = useUser();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwnComment = user?.id === comment.userId;

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() !== comment.content) {
      onEdit(comment.id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
            {comment.userAvatar ? (
              <Image
                src={comment.userAvatar}
                alt={comment.userName}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {comment.userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {comment.userName}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full resize-none rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">{comment.content}</p>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLike(comment.id, 'like')}
                className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-blue-600"
              >
                <ThumbsUp className="h-4 w-4" />
                {comment.likes > 0 && <span>{comment.likes}</span>}
              </button>
              <button
                onClick={() => onLike(comment.id, 'dislike')}
                className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-red-600"
              >
                <ThumbsDown className="h-4 w-4" />
                {comment.dislikes > 0 && <span>{comment.dislikes}</span>}
              </button>
            </div>

            {user && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-sm text-gray-500 transition-colors hover:text-blue-600"
              >
                <Reply className="mr-1 inline h-4 w-4" />
                Reply
              </button>
            )}

            {isOwnComment && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-gray-500 transition-colors hover:text-blue-600"
                >
                  <Edit3 className="mr-1 inline h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-sm text-gray-500 transition-colors hover:text-red-600"
                >
                  <Trash2 className="mr-1 inline h-4 w-4" />
                  Delete
                </button>
              </div>
            )}

            <button className="text-sm text-gray-400 hover:text-gray-600">
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && user && (
        <div className="ml-11 space-y-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full resize-none rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleReply}
              disabled={!replyContent.trim()}
              className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reply
            </button>
            <button
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent('');
              }}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-gray-100 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function RecipeInteractions({
  averageRating,
  totalRatings,
  totalSaves,
  totalLikes,
  comments,
  userInteraction,
  onRate,
  onComment,
  onSave,
  onLike,
  onShare,
  className = '',
}: RecipeInteractionsProps) {
  const { user, isSignedIn } = useUser();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingComment, setRatingComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');

  const handleRateSubmit = () => {
    if (selectedRating > 0) {
      onRate(selectedRating, ratingComment || undefined);
      setShowRatingForm(false);
      setSelectedRating(0);
      setRatingComment('');
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onComment(newComment);
      setNewComment('');
    }
  };

  const handleReply = (parentId: string, content: string) => {
    onComment(content, parentId);
  };

  const handleCommentLike = (commentId: string, type: 'like' | 'dislike') => {
    // This would typically call an API to like/dislike a comment
    console.log(`${type} comment ${commentId}`);
  };

  const handleCommentEdit = (commentId: string, content: string) => {
    // This would typically call an API to edit a comment
    console.log(`Edit comment ${commentId}: ${content}`);
  };

  const handleCommentDelete = (commentId: string) => {
    // This would typically call an API to delete a comment
    console.log(`Delete comment ${commentId}`);
  };

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'likes':
        return b.likes - a.likes;
      case 'newest':
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Rating and Actions Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Average Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={averageRating} size="lg" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">
                  {totalRatings} ratings
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Bookmark className="h-4 w-4" />
                {totalSaves} saves
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {totalLikes} likes
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isSignedIn && (
              <>
                <button
                  onClick={onSave}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
                    userInteraction.isSaved
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {userInteraction.isSaved ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  {userInteraction.isSaved ? 'Saved' : 'Save'}
                </button>

                <button
                  onClick={onLike}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
                    userInteraction.isLiked
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {userInteraction.isLiked ? (
                    <HeartHandshake className="h-4 w-4" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                  Like
                </button>
              </>
            )}

            <button
              onClick={onShare}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        {/* Rating Form */}
        {isSignedIn && !userInteraction.userRating && (
          <div className="border-t pt-6">
            {!showRatingForm ? (
              <button
                onClick={() => setShowRatingForm(true)}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Rate this recipe
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Your Rating
                  </label>
                  <StarRating
                    rating={selectedRating}
                    size="lg"
                    interactive
                    onRate={setSelectedRating}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Add a comment (optional)
                  </label>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Share your thoughts about this recipe..."
                    className="w-full resize-none rounded-md border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleRateSubmit}
                    disabled={selectedRating === 0}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Submit Rating
                  </button>
                  <button
                    onClick={() => {
                      setShowRatingForm(false);
                      setSelectedRating(0);
                      setRatingComment('');
                    }}
                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing User Rating */}
        {userInteraction.userRating && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Your rating:</span>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating rating={userInteraction.userRating} size="md" />
                  <span className="text-sm text-gray-500">
                    ({userInteraction.userRating}/5)
                  </span>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                Edit Rating
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Comments ({comments.length})
          </h3>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'newest' | 'oldest' | 'likes')
              }
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>

        {/* New Comment Form */}
        {isSignedIn && (
          <div className="mb-6 border-b pb-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.firstName?.charAt(0) ||
                      user?.emailAddresses[0]?.emailAddress?.charAt(0) ||
                      'U'}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience with this recipe..."
                  className="w-full resize-none rounded-md border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        {sortedComments.length > 0 ? (
          <div className="space-y-6">
            {sortedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onLike={handleCommentLike}
                onEdit={handleCommentEdit}
                onDelete={handleCommentDelete}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No comments yet</p>
            {isSignedIn && (
              <p className="mt-1 text-sm">
                Be the first to share your thoughts!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Share, Copy, Eye, Edit, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Collection {
  id: string;
  name: string;
  description: string | null;
}

interface ShareData {
  token: string;
  url: string;
  permission: 'view' | 'edit';
  expiresAt?: string;
  createdAt: string;
}

interface CollectionSharingProps {
  collection: Collection;
}

export function CollectionSharingTrigger({
  collection,
}: CollectionSharingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [expiresAt, setExpiresAt] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const body: { permission: string; expiresAt?: string } = { permission };
      if (expiresAt) {
        body.expiresAt = new Date(expiresAt).toISOString();
      }

      const response = await fetch(`/api/collections/${collection.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create share link');
      }

      setShareData(data.share);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create share link'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareData) return;

    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleRemoveSharing = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/collections/${collection.id}/share`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove sharing');
      }

      setShareData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove sharing');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShareData(null);
    setError(null);
    setPermission('view');
    setExpiresAt('');
    setCopied(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Get minimum date for expiration (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Collection</DialogTitle>
          <DialogDescription>
            Share &quot;{collection.name}&quot; with others by creating a
            shareable link.
          </DialogDescription>
        </DialogHeader>

        {!shareData ? (
          <div className="space-y-4">
            {/* Permission Settings */}
            <div className="space-y-3">
              <Label>Permission Level</Label>
              <RadioGroup
                value={permission}
                onValueChange={(value: 'view' | 'edit') => setPermission(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="view" id="view" />
                  <Label
                    htmlFor="view"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Only - Others can see the collection and recipes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="edit" />
                  <Label
                    htmlFor="edit"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Can Edit - Others can add/remove recipes from the collection
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expires">Expiration Date (Optional)</Label>
              <Input
                id="expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={minDateString}
                placeholder="Select expiration date"
              />
              <p className="text-sm text-gray-500">
                Leave empty for a link that never expires
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Create Share Button */}
            <Button
              onClick={handleShare}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Link...' : 'Create Share Link'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Share Success */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-800">
                  Share Link Created Successfully
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {/* Share URL */}
                <div className="space-y-2">
                  <Label>Share URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={shareData.url}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="shrink-0"
                    >
                      {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Share Details */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    {shareData.permission === 'edit' ? (
                      <Edit className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                    <span>
                      {shareData.permission === 'edit'
                        ? 'Can Edit'
                        : 'View Only'}
                    </span>
                  </div>
                  {shareData.expiresAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Expires{' '}
                        {new Date(shareData.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Create New Link
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveSharing}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Removing...' : 'Stop Sharing'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CollectionSharingBadge({}: CollectionSharingProps) {
  // This would show sharing status in the collections list
  // For now, it's a placeholder since we need to check sharing status via API

  return null; // TODO: Implement when we can fetch sharing status

  /* TODO: Uncomment when sharing status API is implemented
  const [isShared, setIsShared] = useState<boolean | null>(null);

  useEffect(() => {
    // Fetch sharing status
    fetch(`/api/collections/${collection.id}/share`)
      .then(res => res.json())
      .then(data => setIsShared(data.isShared))
      .catch(() => setIsShared(false));
  }, [collection.id]);

  if (isShared) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Share className="h-3 w-3" />
        Shared
      </Badge>
    );
  }

  return null;
  */
}

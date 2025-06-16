'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  MoreVertical,
  Folder,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CollectionSharingTrigger } from './collection-sharing';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  recipeCount: number;
  coverImage: string | null;
}

interface CollectionsSectionProps {
  viewMode?: 'grid' | 'list';
}

export default function CollectionsSection({
  viewMode = 'grid',
}: CollectionsSectionProps) {
  const { user, isLoaded } = useUser();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Load collections
  useEffect(() => {
    if (!isLoaded || !user) return;

    loadCollections();
  }, [isLoaded, user]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/collections', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load collections');
      }

      const data = await response.json();
      setCollections(data.collections || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load collections'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);

      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create collection');
      }

      const data = await response.json();
      setCollections((prev) => [data.collection, ...prev]);
      setCreateDialogOpen(false);
      setFormData({ name: '', description: '' });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create collection'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCollection = async () => {
    if (!selectedCollection || !formData.name.trim()) return;

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/collections/${selectedCollection.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update collection');
      }

      const data = await response.json();
      setCollections((prev) =>
        prev.map((col) =>
          col.id === selectedCollection.id ? data.collection : col
        )
      );
      setEditDialogOpen(false);
      setSelectedCollection(null);
      setFormData({ name: '', description: '' });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update collection'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/collections/${selectedCollection.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete collection');
      }

      setCollections((prev) =>
        prev.filter((col) => col.id !== selectedCollection.id)
      );
      setDeleteDialogOpen(false);
      setSelectedCollection(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete collection'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (collection: Collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (collection: Collection) => {
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Collections</h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-3 w-1/2 rounded bg-gray-200"></div>
                <div className="h-3 w-1/3 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Collections</h2>
          <Button onClick={loadCollections}>Retry</Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const CollectionCard = ({ collection }: { collection: Collection }) => (
    <Card className="group transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="truncate pr-2 text-lg font-medium">
          {collection.name}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditDialog(collection)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <div className="w-full">
                <CollectionSharingTrigger collection={collection} />
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => openDeleteDialog(collection)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {collection.description && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">
            {collection.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            <BookOpen className="mr-1 h-3 w-3" />
            {collection.recipeCount} recipes
          </Badge>
          <Button variant="outline" size="sm">
            View Collection
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const CollectionRow = ({ collection }: { collection: Collection }) => (
    <Card className="group transition-shadow duration-200 hover:shadow-sm">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <Folder className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{collection.name}</h3>
              {collection.description && (
                <p className="truncate text-sm text-gray-600">
                  {collection.description}
                </p>
              )}
              <div className="mt-1 flex items-center">
                <Badge variant="secondary" className="text-xs">
                  {collection.recipeCount} recipes
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              View Collection
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(collection)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <CollectionSharingTrigger collection={collection} />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openDeleteDialog(collection)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Collections</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Create a new collection to organize your favorite recipes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter collection name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-description">
                  Description (optional)
                </Label>
                <Textarea
                  id="create-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your collection"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCollection}
                disabled={submitting || !formData.name.trim()}
              >
                {submitting ? 'Creating...' : 'Create Collection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Collections */}
      {collections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No collections yet
            </h3>
            <p className="mb-4 text-center text-gray-600">
              Create your first collection to organize your favorite recipes.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-3'
          }
        >
          {collections.map((collection) =>
            viewMode === 'grid' ? (
              <CollectionCard key={collection.id} collection={collection} />
            ) : (
              <CollectionRow key={collection.id} collection={collection} />
            )
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Update your collection details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter collection name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your collection"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditCollection}
              disabled={submitting || !formData.name.trim()}
            >
              {submitting ? 'Updating...' : 'Update Collection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCollection?.name}
              &quot;? This action cannot be undone. All recipes will be removed
              from this collection.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCollection}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Collection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

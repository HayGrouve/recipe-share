'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tag, FolderOpen, GitBranch, Plus } from 'lucide-react';

interface RecipeTag {
  id: string;
  name: string;
  color: string;
  category:
    | 'dietary'
    | 'cooking-method'
    | 'meal-type'
    | 'cuisine'
    | 'difficulty'
    | 'custom';
  count?: number;
}

interface RecipeCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  recipeCount: number;
  slug: string;
}

interface RecipeVariation {
  id: string;
  title: string;
  description: string;
  changes: {
    ingredients?: string[];
    instructions?: string[];
    cookTime?: number;
    servings?: number;
  };
  difficulty?: string;
  tags?: string[];
  authorNote?: string;
  createdBy?: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface RecipeTagsCategoriesProps {
  tags: RecipeTag[];
  categories: RecipeCategory[];
  variations: RecipeVariation[];
  className?: string;
}

export function RecipeTagsCategories({
  tags,
  categories,
  variations,
  className = '',
}: RecipeTagsCategoriesProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const [showVariationForm, setShowVariationForm] = useState(false);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Tag className="h-5 w-5 text-blue-600" />
          Recipe Tags
        </h3>

        <div className="flex flex-wrap gap-2">
          {tags.slice(0, showAllTags ? tags.length : 8).map((tag) => (
            <Link
              key={tag.id}
              href={`/recipes?tag=${tag.name}`}
              className="inline-flex items-center rounded-full border px-3 py-1 text-sm transition-opacity hover:opacity-80"
            >
              #{tag.name}
            </Link>
          ))}
        </div>

        {tags.length > 8 && (
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700"
          >
            {showAllTags ? 'Show Less' : `Show ${tags.length - 8} More`}
          </button>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <FolderOpen className="h-5 w-5 text-green-600" />
          Related Categories
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/recipes/category/${category.slug}`}
              className="rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <FolderOpen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {category.description}
                  </p>
                  <span className="mt-2 inline-block text-xs text-gray-500">
                    {category.recipeCount} recipes
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <GitBranch className="h-5 w-5 text-purple-600" />
            Recipe Variations ({variations.length})
          </h3>
          <button
            onClick={() => setShowVariationForm(!showVariationForm)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
          >
            <Plus className="mr-1 inline h-4 w-4" />
            Add Variation
          </button>
        </div>

        {variations.length > 0 ? (
          <div className="space-y-4">
            {variations.map((variation) => (
              <div
                key={variation.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <h4 className="mb-2 font-medium text-gray-900">
                  {variation.title}
                </h4>
                <p className="mb-3 text-sm text-gray-600">
                  {variation.description}
                </p>

                <div className="mb-3 flex flex-wrap gap-2">
                  {variation.changes.ingredients && (
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      {variation.changes.ingredients.length} ingredient changes
                    </span>
                  )}
                  {variation.changes.cookTime && (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                      Cook time: {variation.changes.cookTime}m
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  By {variation.createdBy?.name} •{' '}
                  {new Date(variation.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <GitBranch className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No variations created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

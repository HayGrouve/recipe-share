'use client';

import { useEffect } from 'react';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ingredients?: string[];
  instructions?: string[];
  rating?: number;
  reviewCount?: number;
  author?: {
    name: string;
    image?: string;
  };
  category?: string;
  cuisine?: string;
  difficulty?: string;
  calories?: number;
  datePublished?: string;
  dateModified?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface StructuredDataProps {
  type: 'website' | 'recipe' | 'breadcrumb' | 'organization';
  data?: Recipe | BreadcrumbItem[];
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `structured-data-${type}`;

    let structuredData: Record<string, unknown> = {};

    switch (type) {
      case 'website':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Recipe Share',
          description:
            'Share and discover amazing recipes from around the world',
          url:
            process.env.NEXT_PUBLIC_APP_URL ||
            'https://recipe-share.vercel.app',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://recipe-share.vercel.app'}/recipes?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        };
        break;

      case 'organization':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Recipe Share',
          description: 'A platform for sharing and discovering recipes',
          url:
            process.env.NEXT_PUBLIC_APP_URL ||
            'https://recipe-share.vercel.app',
          logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://recipe-share.vercel.app'}/icons/icon-512x512.png`,
          sameAs: [
            // Add social media links when available
          ],
        };
        break;

      case 'recipe':
        if (data && !Array.isArray(data)) {
          const recipeData = data as Recipe;
          structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Recipe',
            name: recipeData.title,
            description: recipeData.description,
            image: recipeData.image ? [recipeData.image] : undefined,
            author: recipeData.author
              ? {
                  '@type': 'Person',
                  name: recipeData.author.name,
                  image: recipeData.author.image,
                }
              : undefined,
            datePublished: recipeData.datePublished,
            dateModified: recipeData.dateModified,
            prepTime: recipeData.prepTime
              ? `PT${recipeData.prepTime}M`
              : undefined,
            cookTime: recipeData.cookTime
              ? `PT${recipeData.cookTime}M`
              : undefined,
            totalTime:
              recipeData.prepTime && recipeData.cookTime
                ? `PT${recipeData.prepTime + recipeData.cookTime}M`
                : undefined,
            recipeYield: recipeData.servings
              ? `${recipeData.servings} servings`
              : undefined,
            recipeCategory: recipeData.category,
            recipeCuisine: recipeData.cuisine,
            difficulty: recipeData.difficulty,
            recipeIngredient: recipeData.ingredients,
            recipeInstructions: recipeData.instructions?.map(
              (instruction: string, index: number) => ({
                '@type': 'HowToStep',
                position: index + 1,
                text: instruction,
              })
            ),
            aggregateRating:
              recipeData.rating && recipeData.reviewCount
                ? {
                    '@type': 'AggregateRating',
                    ratingValue: recipeData.rating,
                    reviewCount: recipeData.reviewCount,
                  }
                : undefined,
            nutrition: recipeData.calories
              ? {
                  '@type': 'NutritionInformation',
                  calories: `${recipeData.calories} calories`,
                }
              : undefined,
          };
        }
        break;

      case 'breadcrumb':
        if (data && Array.isArray(data)) {
          const breadcrumbData = data as BreadcrumbItem[];
          structuredData = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbData.map(
              (item: BreadcrumbItem, index: number) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: item.url,
              })
            ),
          };
        }
        break;
    }

    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(`structured-data-${type}`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [type, data]);

  return null; // This component doesn't render anything
}

// Convenience components for common structured data types
export function WebsiteStructuredData() {
  return <StructuredData type="website" />;
}

export function OrganizationStructuredData() {
  return <StructuredData type="organization" />;
}

export function RecipeStructuredData({ recipe }: { recipe: Recipe }) {
  return <StructuredData type="recipe" data={recipe} />;
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return <StructuredData type="breadcrumb" data={items} />;
}

import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '@/components/recipes/recipe-card';

// Extended mock data for more comprehensive search testing
const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Classic Margherita Pizza',
    description:
      'Authentic Italian pizza with fresh tomatoes, mozzarella, and basil leaves on a crispy thin crust.',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
    prepTime: 30,
    cookTime: 15,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.8,
    ratingCount: 127,
    author: {
      id: 'chef1',
      name: 'Marco Romano',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    category: 'Dinner',
    cuisine: 'Italian',
    dietaryRestrictions: ['Vegetarian'],
    tags: ['pizza', 'comfort-food', 'italian'],
    isBookmarked: false,
    isLiked: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Healthy Buddha Bowl',
    description:
      'Nutritious bowl packed with quinoa, roasted vegetables, avocado, and tahini dressing.',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    prepTime: 20,
    cookTime: 25,
    servings: 2,
    difficulty: 'Easy',
    rating: 4.6,
    ratingCount: 89,
    author: {
      id: 'chef2',
      name: 'Sarah Green',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    },
    category: 'Lunch',
    cuisine: 'Mediterranean',
    dietaryRestrictions: ['Vegan', 'Gluten-Free'],
    tags: ['healthy', 'bowl', 'plant-based'],
    isBookmarked: true,
    isLiked: false,
    createdAt: '2024-01-14T14:30:00Z',
  },
  {
    id: '3',
    title: 'Chocolate Lava Cake',
    description:
      'Decadent individual chocolate cakes with molten centers, served warm with vanilla ice cream.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    difficulty: 'Hard',
    rating: 4.9,
    ratingCount: 203,
    author: {
      id: 'chef3',
      name: 'Pierre Dubois',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    },
    category: 'Dessert',
    cuisine: 'French',
    dietaryRestrictions: ['Vegetarian'],
    tags: ['chocolate', 'dessert', 'indulgent'],
    isBookmarked: false,
    isLiked: false,
    createdAt: '2024-01-13T16:45:00Z',
  },
  {
    id: '4',
    title: 'Spicy Thai Green Curry',
    description:
      'Aromatic and spicy curry with coconut milk, Thai basil, and your choice of protein.',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.7,
    ratingCount: 156,
    author: {
      id: 'chef4',
      name: 'Siriporn Thai',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
    },
    category: 'Dinner',
    cuisine: 'Thai',
    dietaryRestrictions: ['Gluten-Free'],
    tags: ['spicy', 'curry', 'asian'],
    isBookmarked: true,
    isLiked: true,
    createdAt: '2024-01-12T18:20:00Z',
  },
  {
    id: '5',
    title: 'Avocado Toast Supreme',
    description:
      'Elevated avocado toast with poached egg, cherry tomatoes, and everything bagel seasoning.',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
    prepTime: 10,
    cookTime: 5,
    servings: 2,
    difficulty: 'Easy',
    rating: 4.4,
    ratingCount: 72,
    author: {
      id: 'chef5',
      name: 'Emma Williams',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    },
    category: 'Breakfast',
    cuisine: 'American',
    dietaryRestrictions: ['Vegetarian'],
    tags: ['avocado', 'breakfast', 'quick'],
    isBookmarked: false,
    isLiked: false,
    createdAt: '2024-01-11T08:15:00Z',
  },
  {
    id: '6',
    title: 'Mediterranean Quinoa Salad',
    description:
      'Fresh and vibrant salad with quinoa, olives, feta cheese, and lemon herb dressing.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    prepTime: 25,
    cookTime: 15,
    servings: 6,
    difficulty: 'Easy',
    rating: 4.5,
    ratingCount: 94,
    author: {
      id: 'chef6',
      name: 'Dimitri Kostas',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    category: 'Lunch',
    cuisine: 'Mediterranean',
    dietaryRestrictions: ['Vegetarian', 'Gluten-Free'],
    tags: ['salad', 'healthy', 'mediterranean'],
    isBookmarked: false,
    isLiked: true,
    createdAt: '2024-01-10T12:30:00Z',
  },
  {
    id: '7',
    title: 'Korean Beef Bulgogi',
    description:
      'Tender marinated beef stir-fried with vegetables, served with steamed rice and kimchi.',
    image: 'https://images.unsplash.com/photo-1621863056770-9dd8fc66e2c3?w=400',
    prepTime: 45,
    cookTime: 15,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.7,
    ratingCount: 142,
    author: {
      id: 'chef7',
      name: 'Min-jun Kim',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    },
    category: 'Dinner',
    cuisine: 'Korean',
    dietaryRestrictions: ['Gluten-Free'],
    tags: ['beef', 'asian', 'stir-fry'],
    isBookmarked: false,
    isLiked: false,
    createdAt: '2024-01-09T19:30:00Z',
  },
  {
    id: '8',
    title: 'Classic French Croissants',
    description:
      'Buttery, flaky croissants made from scratch with laminated dough technique.',
    image: 'https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=400',
    prepTime: 180,
    cookTime: 25,
    servings: 8,
    difficulty: 'Hard',
    rating: 4.9,
    ratingCount: 87,
    author: {
      id: 'chef8',
      name: 'Marie Leclerc',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    },
    category: 'Breakfast',
    cuisine: 'French',
    dietaryRestrictions: ['Vegetarian'],
    tags: ['pastry', 'bread', 'traditional'],
    isBookmarked: true,
    isLiked: true,
    createdAt: '2024-01-08T07:45:00Z',
  },
  {
    id: '9',
    title: 'Mexican Street Tacos',
    description:
      'Authentic street-style tacos with corn tortillas, carnitas, and fresh cilantro-onion salsa.',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400',
    prepTime: 30,
    cookTime: 45,
    servings: 6,
    difficulty: 'Medium',
    rating: 4.6,
    ratingCount: 176,
    author: {
      id: 'chef9',
      name: 'Carlos Rodriguez',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    category: 'Dinner',
    cuisine: 'Mexican',
    dietaryRestrictions: ['Gluten-Free'],
    tags: ['tacos', 'street-food', 'mexican'],
    isBookmarked: false,
    isLiked: true,
    createdAt: '2024-01-07T18:15:00Z',
  },
  {
    id: '10',
    title: 'Indian Butter Chicken',
    description:
      'Creamy tomato-based curry with tender chicken pieces, served with basmati rice and naan.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    prepTime: 20,
    cookTime: 40,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.8,
    ratingCount: 198,
    author: {
      id: 'chef10',
      name: 'Priya Sharma',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
    },
    category: 'Dinner',
    cuisine: 'Indian',
    dietaryRestrictions: ['Gluten-Free'],
    tags: ['curry', 'chicken', 'spicy'],
    isBookmarked: true,
    isLiked: false,
    createdAt: '2024-01-06T17:20:00Z',
  },
];

interface SearchParams {
  q?: string; // search query
  category?: string;
  cuisine?: string;
  difficulty?: string;
  dietaryRestrictions?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: SearchParams = {
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      cuisine: searchParams.get('cuisine') || '',
      difficulty: searchParams.get('difficulty') || '',
      dietaryRestrictions: searchParams.get('dietaryRestrictions') || '',
      sortBy: searchParams.get('sortBy') || 'newest',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    };

    // Simulate network delay for realistic behavior
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Filter recipes based on search criteria
    const filteredRecipes = [...mockRecipes].filter((recipe) => {
      // Text search - search in title, description, tags, author name
      const searchQuery = params.q?.toLowerCase() || '';
      const matchesSearch =
        searchQuery === '' ||
        recipe.title.toLowerCase().includes(searchQuery) ||
        recipe.description.toLowerCase().includes(searchQuery) ||
        recipe.author.name.toLowerCase().includes(searchQuery) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery)) ||
        recipe.cuisine.toLowerCase().includes(searchQuery) ||
        recipe.category.toLowerCase().includes(searchQuery);

      // Category filter
      const matchesCategory =
        params.category === '' || recipe.category === params.category;

      // Cuisine filter
      const matchesCuisine =
        params.cuisine === '' || recipe.cuisine === params.cuisine;

      // Difficulty filter
      const matchesDifficulty =
        params.difficulty === '' || recipe.difficulty === params.difficulty;

      // Dietary restrictions filter
      const dietaryRestrictions =
        params.dietaryRestrictions?.split(',').filter(Boolean) || [];
      const matchesDietaryRestrictions =
        dietaryRestrictions.length === 0 ||
        dietaryRestrictions.every((restriction) =>
          recipe.dietaryRestrictions.includes(restriction)
        );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCuisine &&
        matchesDifficulty &&
        matchesDietaryRestrictions
      );
    });

    // Sort recipes
    switch (params.sortBy) {
      case 'newest':
        filteredRecipes.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        filteredRecipes.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'rating':
        filteredRecipes.sort((a, b) => b.rating - a.rating);
        break;
      case 'prepTime':
        filteredRecipes.sort(
          (a, b) => a.prepTime + a.cookTime - (b.prepTime + b.cookTime)
        );
        break;
      case 'alphabetical':
        filteredRecipes.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popular':
        filteredRecipes.sort((a, b) => b.ratingCount - a.ratingCount);
        break;
      default:
        break;
    }

    // Pagination
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '10');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredRecipes.length / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Return response with metadata
    return NextResponse.json({
      recipes: paginatedRecipes,
      pagination: {
        page,
        limit,
        total: filteredRecipes.length,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        categories: Array.from(
          new Set(mockRecipes.map((r) => r.category))
        ).sort(),
        cuisines: Array.from(new Set(mockRecipes.map((r) => r.cuisine))).sort(),
        difficulties: ['Easy', 'Medium', 'Hard'],
        dietaryRestrictions: Array.from(
          new Set(mockRecipes.flatMap((r) => r.dietaryRestrictions))
        ).sort(),
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { PrismaClient, Prisma } from '../generated/prisma';

// Declare global variable for Prisma instance to prevent multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Create a singleton instance of PrismaClient
// In development, this prevents exhausting database connections due to hot reloading
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };

// Type definitions for better type safety
type RecipeFindManyOptions = {
  where?: Prisma.RecipeWhereInput;
  include?: Prisma.RecipeInclude;
  orderBy?: Prisma.RecipeOrderByWithRelationInput;
  take?: number;
  skip?: number;
};

type RecipeCreateInput = Prisma.RecipeCreateInput;
type RecipeUpdateInput = Prisma.RecipeUpdateInput;

// Database utility functions
export const db = {
  // User operations
  user: {
    findByClerkId: (clerkId: string) =>
      prisma.user.findUnique({
        where: { clerkId },
      }),

    findByEmail: (email: string) =>
      prisma.user.findUnique({
        where: { email },
      }),

    create: (data: {
      clerkId: string;
      email: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      avatar?: string;
    }) => prisma.user.create({ data }),

    update: (
      id: string,
      data: Partial<{
        firstName: string;
        lastName: string;
        username: string;
        avatar: string;
        bio: string;
      }>
    ) =>
      prisma.user.update({
        where: { id },
        data,
      }),
  },

  // Recipe operations
  recipe: {
    findMany: (options?: RecipeFindManyOptions) =>
      prisma.recipe.findMany({
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
          images: true,
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              ratings: true,
              comments: true,
              saves: true,
            },
          },
        },
        ...options,
      }),

    findById: (id: string) =>
      prisma.recipe.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
          ingredients: {
            include: {
              ingredient: true,
            },
            orderBy: {
              id: 'asc',
            },
          },
          instructions: {
            orderBy: {
              stepNumber: 'asc',
            },
          },
          images: true,
          nutrition: true,
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          ratings: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              ratings: true,
              comments: true,
              saves: true,
            },
          },
        },
      }),

    findBySlug: (slug: string) =>
      prisma.recipe.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
          ingredients: {
            include: {
              ingredient: true,
            },
            orderBy: {
              id: 'asc',
            },
          },
          instructions: {
            orderBy: {
              stepNumber: 'asc',
            },
          },
          images: true,
          nutrition: true,
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),

    create: (data: RecipeCreateInput) => prisma.recipe.create({ data }),

    update: (id: string, data: RecipeUpdateInput) =>
      prisma.recipe.update({
        where: { id },
        data,
      }),

    delete: (id: string) =>
      prisma.recipe.delete({
        where: { id },
      }),
  },

  // Category operations
  category: {
    findMany: () =>
      prisma.category.findMany({
        include: {
          _count: {
            select: {
              recipes: true,
            },
          },
        },
      }),

    findBySlug: (slug: string) =>
      prisma.category.findUnique({
        where: { slug },
      }),
  },

  // Collection operations
  collection: {
    findByUserId: (userId: string) =>
      prisma.collection.findMany({
        where: { userId },
        include: {
          recipes: {
            include: {
              recipe: {
                include: {
                  author: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      username: true,
                      avatar: true,
                    },
                  },
                  images: true,
                },
              },
            },
          },
          _count: {
            select: {
              recipes: true,
            },
          },
        },
      }),

    create: (data: {
      name: string;
      description?: string;
      isPublic?: boolean;
      userId: string;
    }) => prisma.collection.create({ data }),
  },

  // Rating operations
  rating: {
    upsert: (data: {
      userId: string;
      recipeId: string;
      score: number;
      review?: string;
    }) =>
      prisma.rating.upsert({
        where: {
          userId_recipeId: {
            userId: data.userId,
            recipeId: data.recipeId,
          },
        },
        update: {
          score: data.score,
          review: data.review,
        },
        create: data,
      }),

    getAverageByRecipeId: async (recipeId: string) => {
      const result = await prisma.rating.aggregate({
        where: { recipeId },
        _avg: { score: true },
        _count: { score: true },
      });
      return {
        average: result._avg.score || 0,
        count: result._count.score,
      };
    },
  },

  // Saved recipe operations
  savedRecipe: {
    toggle: async (userId: string, recipeId: string) => {
      const existing = await prisma.savedRecipe.findUnique({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      });

      if (existing) {
        await prisma.savedRecipe.delete({
          where: { id: existing.id },
        });
        return false; // Removed from saves
      } else {
        await prisma.savedRecipe.create({
          data: { userId, recipeId },
        });
        return true; // Added to saves
      }
    },

    findByUserId: (userId: string) =>
      prisma.savedRecipe.findMany({
        where: { userId },
        include: {
          recipe: {
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                  avatar: true,
                },
              },
              images: true,
              categories: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
  },
};

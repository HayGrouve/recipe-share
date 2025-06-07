import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'appetizers' },
      update: {},
      create: {
        name: 'Appetizers',
        description: 'Small dishes served before the main course',
        slug: 'appetizers',
        color: '#FF6B35',
        icon: 'utensils',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'main-courses' },
      update: {},
      create: {
        name: 'Main Courses',
        description: 'The principal dish of a meal',
        slug: 'main-courses',
        color: '#4A7C59',
        icon: 'chef-hat',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'desserts' },
      update: {},
      create: {
        name: 'Desserts',
        description: 'Sweet dishes served at the end of a meal',
        slug: 'desserts',
        color: '#F4A261',
        icon: 'cookie',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'beverages' },
      update: {},
      create: {
        name: 'Beverages',
        description: 'Drinks and beverages',
        slug: 'beverages',
        color: '#2A9D8F',
        icon: 'coffee',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'salads' },
      update: {},
      create: {
        name: 'Salads',
        description: 'Fresh and healthy salad dishes',
        slug: 'salads',
        color: '#43AA8B',
        icon: 'leaf',
      },
    }),
  ]);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'vegetarian' },
      update: {},
      create: { name: 'Vegetarian', slug: 'vegetarian' },
    }),
    prisma.tag.upsert({
      where: { slug: 'vegan' },
      update: {},
      create: { name: 'Vegan', slug: 'vegan' },
    }),
    prisma.tag.upsert({
      where: { slug: 'gluten-free' },
      update: {},
      create: { name: 'Gluten-Free', slug: 'gluten-free' },
    }),
    prisma.tag.upsert({
      where: { slug: 'quick' },
      update: {},
      create: { name: 'Quick', slug: 'quick' },
    }),
    prisma.tag.upsert({
      where: { slug: 'healthy' },
      update: {},
      create: { name: 'Healthy', slug: 'healthy' },
    }),
    prisma.tag.upsert({
      where: { slug: 'comfort-food' },
      update: {},
      create: { name: 'Comfort Food', slug: 'comfort-food' },
    }),
    prisma.tag.upsert({
      where: { slug: 'spicy' },
      update: {},
      create: { name: 'Spicy', slug: 'spicy' },
    }),
    prisma.tag.upsert({
      where: { slug: 'family-friendly' },
      update: {},
      create: { name: 'Family Friendly', slug: 'family-friendly' },
    }),
  ]);

  // Create common ingredients
  const ingredients = await Promise.all([
    prisma.ingredient.upsert({
      where: { name: 'Olive Oil' },
      update: {},
      create: { name: 'Olive Oil', unit: 'tablespoons' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Salt' },
      update: {},
      create: { name: 'Salt', unit: 'teaspoons' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Black Pepper' },
      update: {},
      create: { name: 'Black Pepper', unit: 'teaspoons' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Garlic' },
      update: {},
      create: { name: 'Garlic', unit: 'cloves' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Onion' },
      update: {},
      create: { name: 'Onion', unit: 'pieces' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Tomatoes' },
      update: {},
      create: { name: 'Tomatoes', unit: 'pieces' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Pasta' },
      update: {},
      create: { name: 'Pasta', unit: 'pounds' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Parmesan Cheese' },
      update: {},
      create: { name: 'Parmesan Cheese', unit: 'cups' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Fresh Basil' },
      update: {},
      create: { name: 'Fresh Basil', unit: 'leaves' },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Chicken Breast' },
      update: {},
      create: { name: 'Chicken Breast', unit: 'pounds' },
    }),
  ]);

  // Create a sample user (in a real app, users would be created via Clerk)
  const sampleUser = await prisma.user.upsert({
    where: { email: 'chef@recipeshare.com' },
    update: {},
    create: {
      clerkId: 'sample_clerk_id_123',
      email: 'chef@recipeshare.com',
      firstName: 'Gordon',
      lastName: 'Ramsey',
      username: 'chef_gordon',
      avatar:
        'https://images.unsplash.com/photo-1583394293214-28a917421e86?w=150&h=150&fit=crop&crop=face',
      bio: 'Passionate about creating delicious recipes for everyone to enjoy!',
    },
  });

  // Create sample recipes
  const pastaRecipe = await prisma.recipe.create({
    data: {
      title: 'Classic Spaghetti Aglio e Olio',
      description:
        'A simple yet elegant Italian pasta dish with garlic, olive oil, and red pepper flakes.',
      content: `This classic Italian pasta dish is the epitome of simplicity and flavor. With just a few quality ingredients, you can create a restaurant-quality meal at home.

The key to perfect aglio e olio is timing - the garlic should be golden and fragrant, not brown and bitter. The pasta water helps create a silky sauce that coats every strand.`,
      servings: 4,
      prepTime: 10,
      cookTime: 15,
      totalTime: 25,
      difficulty: 'Easy',
      isPublic: true,
      slug: 'classic-spaghetti-aglio-e-olio',
      authorId: sampleUser.id,
    },
  });

  // Add ingredients to the pasta recipe
  await Promise.all([
    prisma.recipeIngredient.create({
      data: {
        recipeId: pastaRecipe.id,
        ingredientId: ingredients.find((i) => i.name === 'Pasta')!.id,
        quantity: '1',
        unit: 'pound',
        notes: 'spaghetti or linguine',
      },
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: pastaRecipe.id,
        ingredientId: ingredients.find((i) => i.name === 'Olive Oil')!.id,
        quantity: '6',
        unit: 'tablespoons',
        notes: 'extra virgin',
      },
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: pastaRecipe.id,
        ingredientId: ingredients.find((i) => i.name === 'Garlic')!.id,
        quantity: '6',
        unit: 'cloves',
        notes: 'thinly sliced',
      },
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: pastaRecipe.id,
        ingredientId: ingredients.find((i) => i.name === 'Salt')!.id,
        quantity: '1',
        unit: 'teaspoon',
      },
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: pastaRecipe.id,
        ingredientId: ingredients.find((i) => i.name === 'Black Pepper')!.id,
        quantity: '1/2',
        unit: 'teaspoon',
        notes: 'freshly ground',
      },
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: pastaRecipe.id,
        ingredientId: ingredients.find((i) => i.name === 'Parmesan Cheese')!.id,
        quantity: '1/2',
        unit: 'cup',
        notes: 'freshly grated',
      },
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: pastaRecipe.id,
        ingredientId: ingredients.find((i) => i.name === 'Fresh Basil')!.id,
        quantity: '10',
        unit: 'leaves',
        notes: 'for garnish',
      },
    }),
  ]);

  // Add instructions to the pasta recipe
  await Promise.all([
    prisma.instruction.create({
      data: {
        recipeId: pastaRecipe.id,
        stepNumber: 1,
        content:
          'Bring a large pot of salted water to boil. Cook pasta according to package directions until al dente.',
        timeMinutes: 8,
      },
    }),
    prisma.instruction.create({
      data: {
        recipeId: pastaRecipe.id,
        stepNumber: 2,
        content:
          'While pasta cooks, heat olive oil in a large skillet over medium heat.',
        timeMinutes: 2,
      },
    }),
    prisma.instruction.create({
      data: {
        recipeId: pastaRecipe.id,
        stepNumber: 3,
        content:
          'Add sliced garlic to the oil and cook until golden and fragrant, about 2-3 minutes. Do not let it brown.',
        timeMinutes: 3,
      },
    }),
    prisma.instruction.create({
      data: {
        recipeId: pastaRecipe.id,
        stepNumber: 4,
        content: 'Reserve 1 cup of pasta cooking water, then drain the pasta.',
        timeMinutes: 1,
      },
    }),
    prisma.instruction.create({
      data: {
        recipeId: pastaRecipe.id,
        stepNumber: 5,
        content:
          'Add the drained pasta to the skillet with garlic oil. Toss to combine, adding pasta water gradually until you achieve a silky sauce.',
        timeMinutes: 2,
      },
    }),
    prisma.instruction.create({
      data: {
        recipeId: pastaRecipe.id,
        stepNumber: 6,
        content:
          'Season with salt and pepper. Serve immediately topped with Parmesan cheese and fresh basil.',
        timeMinutes: 1,
      },
    }),
  ]);

  // Add categories and tags to the recipe
  await Promise.all([
    prisma.recipeCategory.create({
      data: {
        recipeId: pastaRecipe.id,
        categoryId: categories.find((c) => c.slug === 'main-courses')!.id,
      },
    }),
    prisma.recipeTag.create({
      data: {
        recipeId: pastaRecipe.id,
        tagId: tags.find((t) => t.slug === 'vegetarian')!.id,
      },
    }),
    prisma.recipeTag.create({
      data: {
        recipeId: pastaRecipe.id,
        tagId: tags.find((t) => t.slug === 'quick')!.id,
      },
    }),
    prisma.recipeTag.create({
      data: {
        recipeId: pastaRecipe.id,
        tagId: tags.find((t) => t.slug === 'family-friendly')!.id,
      },
    }),
  ]);

  // Add nutrition information
  await prisma.nutrition.create({
    data: {
      recipeId: pastaRecipe.id,
      calories: 420,
      protein: 12.5,
      carbs: 58.2,
      fat: 14.8,
      fiber: 2.1,
      sugar: 2.8,
      sodium: 580,
      cholesterol: 8,
      saturatedFat: 3.2,
    },
  });

  // Add a sample recipe image
  await prisma.recipeImage.create({
    data: {
      recipeId: pastaRecipe.id,
      url: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800&h=600&fit=crop',
      alt: 'Classic Spaghetti Aglio e Olio on a white plate',
      caption: 'Simple yet elegant pasta dish',
      isPrimary: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created:`);
  console.log(`  - ${categories.length} categories`);
  console.log(`  - ${tags.length} tags`);
  console.log(`  - ${ingredients.length} ingredients`);
  console.log(`  - 1 sample user`);
  console.log(`  - 1 sample recipe with full details`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

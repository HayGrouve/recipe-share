import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChefHat,
  Clock,
  Users,
  Star,
  Search,
  BookOpen,
  Heart,
  Utensils,
} from 'lucide-react';
import { FeaturedRecipesCarousel } from '@/components/ui/featured-recipes-carousel';
import { TestimonialsSection } from '@/components/ui/testimonials-section';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div
            className="h-full w-full bg-cover bg-center bg-no-repeat opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="bg-primary/10 text-primary mb-8 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium">
              <ChefHat className="mr-2 h-4 w-4" />
              Welcome to RecipeShare
            </div>

            <h1 className="font-serif text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Share Your <span className="text-primary">Culinary</span>{' '}
              <br className="hidden sm:block" />
              Adventures
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Discover, create, and share delicious recipes with your friends.
              RecipeShare makes it easy to organize your favorite dishes and
              explore new culinary horizons together.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Button
                asChild
                size="lg"
                className="w-full px-8 text-lg shadow-lg transition-shadow hover:shadow-xl sm:w-auto"
              >
                <Link href="/recipes">
                  <Search className="mr-2 h-5 w-5" />
                  Explore Recipes
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="hover:bg-primary/5 w-full border-2 px-8 text-lg sm:w-auto"
              >
                <Link href="/create">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Create Recipe
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-col items-center justify-center gap-4 text-sm text-gray-500 sm:flex-row sm:gap-8">
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.9/5 rating</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                <span className="font-medium">25+ active friends</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="mr-1 h-4 w-4" />
                <span className="font-medium">150+ recipes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes Carousel */}
      <FeaturedRecipesCarousel />

      {/* Stats Section */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <BookOpen className="text-primary h-8 w-8" />
              </div>
              <h3 className="mt-4 text-3xl font-bold">150+</h3>
              <p className="text-muted-foreground">Delicious Recipes</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Users className="text-secondary h-8 w-8" />
              </div>
              <h3 className="mt-4 text-3xl font-bold">25</h3>
              <p className="text-muted-foreground">Active Friends</p>
            </div>
            <div className="text-center">
              <div className="bg-accent/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Star className="text-accent h-8 w-8" />
              </div>
              <h3 className="mt-4 text-3xl font-bold">4.9</h3>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Heart className="text-primary h-8 w-8" />
              </div>
              <h3 className="mt-4 text-3xl font-bold">500+</h3>
              <p className="text-muted-foreground">Recipe Saves</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for your culinary journey
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              From discovering new recipes to sharing your own creations,
              RecipeShare has all the tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Search className="text-primary h-6 w-6" />
                </div>
                <CardTitle>Smart Search &amp; Filters</CardTitle>
                <CardDescription>
                  Find recipes by ingredients, cuisine, dietary restrictions,
                  prep time, and more with our intelligent search system.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
              <CardHeader>
                <div className="bg-secondary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Utensils className="text-secondary h-6 w-6" />
                </div>
                <CardTitle>Rich Recipe Editor</CardTitle>
                <CardDescription>
                  Create beautiful recipes with our intuitive editor. Add
                  images, format instructions, and organize ingredients
                  effortlessly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-accent/20 hover:border-accent/40 transition-colors">
              <CardHeader>
                <div className="bg-accent/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Users className="text-accent h-6 w-6" />
                </div>
                <CardTitle>Social Sharing</CardTitle>
                <CardDescription>
                  Share recipes with friends, rate dishes, leave comments, and
                  build your personal recipe collections together.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Clock className="text-primary h-6 w-6" />
                </div>
                <CardTitle>Kitchen-Friendly</CardTitle>
                <CardDescription>
                  Mobile-optimized interface perfect for cooking. Large buttons,
                  clear instructions, and timer integration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
              <CardHeader>
                <div className="bg-secondary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <BookOpen className="text-secondary h-6 w-6" />
                </div>
                <CardTitle>Recipe Collections</CardTitle>
                <CardDescription>
                  Organize recipes into custom collections. Create themed lists
                  like &ldquo;Weekend Favorites&rdquo; or &ldquo;Quick
                  Meals&rdquo;.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-accent/20 hover:border-accent/40 transition-colors">
              <CardHeader>
                <div className="bg-accent/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Star className="text-accent h-6 w-6" />
                </div>
                <CardTitle>Ratings &amp; Reviews</CardTitle>
                <CardDescription>
                  Rate recipes, leave detailed reviews, and discover the most
                  loved dishes in your friend group.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="from-primary to-secondary bg-gradient-to-r py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start cooking?
            </h2>
            <p className="mt-4 text-lg text-white/90">
              Join your friends and start sharing amazing recipes today.
              It&apos;s free and takes less than a minute to get started.
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="text-primary bg-white px-8 text-lg hover:bg-white/90"
              >
                <Link href="/recipes">
                  <ChefHat className="mr-2 h-5 w-5" />
                  Start Exploring
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from 'next/link';
import { ChefHat, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 flex items-center space-x-2">
              <ChefHat className="text-primary h-6 w-6" />
              <span className="text-primary font-serif text-xl font-bold">
                RecipeShare
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md text-sm">
              Share your culinary adventures with friends. Discover, create, and
              organize your favorite recipes in one beautiful place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/recipes"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Browse Recipes
                </Link>
              </li>
              <li>
                <Link
                  href="/create"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Create Recipe
                </Link>
              </li>
              <li>
                <Link
                  href="/my-recipes"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  My Recipes
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 font-semibold">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/recipes?category=breakfast"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Breakfast
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes?category=dinner"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Dinner
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes?category=desserts"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Desserts
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            © 2024 RecipeShare. Made with{' '}
            <Heart className="inline h-4 w-4 text-red-500" /> for food lovers.
          </p>
          <div className="mt-4 flex space-x-4 sm:mt-0">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChefHat, Search, User } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <ChefHat className="text-primary h-8 w-8" />
          <span className="text-primary font-serif text-2xl font-bold">
            RecipeShare
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          <Link
            href="/recipes"
            className="hover:text-primary text-sm font-medium transition-colors"
          >
            Recipes
          </Link>
          <Link
            href="/create"
            className="hover:text-primary text-sm font-medium transition-colors"
          >
            Create Recipe
          </Link>
          <Link
            href="/my-recipes"
            className="hover:text-primary text-sm font-medium transition-colors"
          >
            My Recipes
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

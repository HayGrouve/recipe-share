'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChefHat, Search, Menu } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { href: '/recipes', label: 'Recipes' },
    { href: '/recipes/create', label: 'Create Recipe' },
    { href: '/my-recipes', label: 'My Recipes' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <>
      {/* Skip Links - hidden by default, visible on focus */}
      <div className="sr-only focus-within:not-sr-only">
        <a
          href="#main-content"
          className="bg-primary text-primary-foreground focus:ring-primary-foreground fixed top-4 left-4 z-[100] rounded-md px-4 py-2 focus:ring-2 focus:outline-none"
        >
          Skip to main content
        </a>
        <a
          href="#main-navigation"
          className="bg-primary text-primary-foreground focus:ring-primary-foreground fixed top-16 left-4 z-[100] rounded-md px-4 py-2 focus:ring-2 focus:outline-none"
        >
          Skip to navigation
        </a>
      </div>

      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
            <span className="text-primary font-serif text-lg font-bold sm:text-2xl">
              RecipeShare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            id="main-navigation"
            className="hidden items-center space-x-4 lg:flex"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-primary text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search recipes</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 pt-6">
                  <div className="flex items-center space-x-2 border-b pb-4">
                    <ChefHat className="text-primary h-6 w-6" />
                    <span className="text-primary font-serif text-xl font-bold">
                      RecipeShare
                    </span>
                  </div>

                  <nav className="flex flex-col space-y-3">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="hover:text-primary hover:bg-muted block rounded-md px-3 py-2 text-base font-medium transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="border-t pt-4">
                    <SignedOut>
                      <div className="flex flex-col space-y-2">
                        <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </div>
                    </SignedOut>

                    <SignedIn>
                      <div className="flex items-center space-x-3 px-3 py-2">
                        <UserButton
                          appearance={{
                            elements: {
                              avatarBox: 'h-8 w-8',
                            },
                          }}
                        />
                        <span className="text-sm font-medium">My Account</span>
                      </div>
                    </SignedIn>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Authentication */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              <SignedOut>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </SignedOut>

              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                    },
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

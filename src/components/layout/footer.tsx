import Link from 'next/link';
import {
  ChefHat,
  Facebook,
  Twitter,
  Instagram,
  Github,
  Mail,
} from 'lucide-react';

const footerLinks = {
  recipes: [
    { name: 'Browse Recipes', href: '/recipes' },
    { name: 'Create Recipe', href: '/create' },
    { name: 'Popular Recipes', href: '/recipes/popular' },
    { name: 'Recent Recipes', href: '/recipes/recent' },
  ],
  community: [
    { name: 'About Us', href: '/about' },
    { name: 'Friend Groups', href: '/friends' },
    { name: 'Collections', href: '/collections' },
    { name: 'Help Center', href: '/help' },
  ],
  account: [
    { name: 'Sign In', href: '/sign-in' },
    { name: 'Sign Up', href: '/sign-up' },
    { name: 'Profile', href: '/profile' },
    { name: 'Settings', href: '/settings' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Contact', href: '/contact' },
  ],
};

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'GitHub', icon: Github, href: '#' },
  { name: 'Email', icon: Mail, href: 'mailto:hello@recipeshare.com' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white">
              <ChefHat className="h-8 w-8" />
              <span className="font-serif text-xl font-bold">RecipeShare</span>
            </Link>
            <p className="mt-4 text-sm leading-6">
              Share your culinary adventures with friends. Discover, create, and
              organize delicious recipes in one beautiful place.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 transition-colors hover:text-white"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Links sections */}
          <div>
            <h3 className="text-sm font-semibold text-white">Recipes</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.recipes.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Community</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Account</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm">
              © 2024 RecipeShare. All rights reserved. Made with ❤️ for food
              lovers.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="transition-colors hover:text-white"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-white"
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-white"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

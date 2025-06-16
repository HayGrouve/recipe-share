import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import '@/styles/print.css';
import '@/styles/mobile-accessibility.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryProvider } from '@/components/providers/query-provider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RecipeShare - Share Your Culinary Adventures',
  description:
    'A modern recipe sharing platform for you and your friends. Discover, create, and share delicious recipes with an intuitive and responsive interface.',
  keywords: ['recipes', 'cooking', 'food', 'share', 'culinary', 'kitchen'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${playfairDisplay.variable} font-sans antialiased`}
        >
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

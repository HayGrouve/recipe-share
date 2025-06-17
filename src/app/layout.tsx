import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import '@/styles/print.css';
import '@/styles/mobile-accessibility.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from 'sonner';
import { WebVitals, WebVitalsDisplay } from '@/components/analytics/web-vitals';
import {
  PWAInstallPrompt,
  IOSInstallPrompt,
} from '@/components/pwa/install-prompt';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';

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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Recipe Share',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#ff6b35',
    'msapplication-TileImage': '/icons/icon-144x144.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ff6b35',
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
          suppressHydrationWarning={true}
        >
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster position="top-right" richColors />
            <WebVitals />
            <WebVitalsDisplay />
            <PWAInstallPrompt />
            <IOSInstallPrompt />
            <OfflineIndicator />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

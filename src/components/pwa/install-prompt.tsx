'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)'
    ).matches;
    const isInWebAppiOS =
      (window.navigator as { standalone?: boolean }).standalone === true;
    const isInstalled = isStandalone || isInWebAppiOS;

    setIsInstalled(isInstalled);

    if (!isInstalled) {
      // Listen for the beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        setDeferredPrompt(e);
        // Update UI to notify the user they can install the PWA
        setShowInstallPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Listen for the app installed event
      window.addEventListener('appinstalled', () => {
        setShowInstallPrompt(false);
        setIsInstalled(true);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt
        );
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt for next time
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Remember user dismissed this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or user dismissed this session
  if (
    isInstalled ||
    !showInstallPrompt ||
    sessionStorage.getItem('pwa-install-dismissed')
  ) {
    return null;
  }

  return (
    <Card className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-sm border-orange-200 bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
              <Smartphone className="h-4 w-4 text-orange-600" />
            </div>
            <CardTitle className="text-sm font-semibold">
              Install Recipe Share
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Get quick access to recipes and cook offline
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex space-x-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="flex-1 text-xs"
          >
            <Download className="mr-1 h-3 w-3" />
            Install
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="flex-1 text-xs"
          >
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Alternative component for iOS Safari users (since beforeinstallprompt doesn't work)
export function IOSInstallPrompt() {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as { standalone?: boolean })
      .standalone;
    const hasShownPrompt = localStorage.getItem('ios-install-prompt-shown');

    if (isIOS && !isInStandaloneMode && !hasShownPrompt) {
      // Show after a delay to not be intrusive
      const timer = setTimeout(() => {
        setShowIOSPrompt(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowIOSPrompt(false);
    localStorage.setItem('ios-install-prompt-shown', 'true');
  };

  if (!showIOSPrompt) return null;

  return (
    <Card className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-sm border-blue-200 bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Add to Home Screen
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="mb-3 text-xs text-gray-600">
          Tap the share button <span className="font-mono">□↗</span> in Safari,
          then select &quot;Add to Home Screen&quot; to install Recipe Share.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDismiss}
          className="w-full text-xs"
        >
          Got it
        </Button>
      </CardContent>
    </Card>
  );
}

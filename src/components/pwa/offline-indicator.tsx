'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    // Initialize online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);

      // Auto-hide alert after 10 seconds
      setTimeout(() => {
        setShowOfflineAlert(false);
      }, 10000);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persistent offline indicator
  if (!isOnline) {
    return (
      <div className="fixed top-16 right-4 left-4 z-40 mx-auto max-w-sm">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center space-x-2 p-3">
            <WifiOff className="h-4 w-4 text-orange-600" />
            <p className="text-sm text-orange-800">
              You&apos;re offline. Some features may be limited.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Temporary connection restored alert
  if (isOnline && showOfflineAlert) {
    return (
      <div className="fixed top-16 right-4 left-4 z-40 mx-auto max-w-sm">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center space-x-2 p-3">
            <Wifi className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">Connection restored!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

// Hook for components to check online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Component for handling offline-specific UI states
export function OfflineNotice({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="mt-0.5 h-5 w-5 text-orange-600" />
        <div className="text-orange-800">{children}</div>
      </div>
    </div>
  );
}

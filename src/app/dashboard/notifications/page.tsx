import { Metadata } from 'next';
import { Notifications } from '@/components/dashboard/notifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, BellOff } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notifications | Recipe Share',
  description: 'View and manage your notifications',
};

export default function NotificationsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-600">
              Stay updated with your recipe community
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>All Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center space-x-2">
            <BellOff className="h-4 w-4" />
            <span>Unread Only</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="rounded-lg border bg-white p-6">
            <Notifications unreadOnly={false} />
          </div>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <div className="rounded-lg border bg-white p-6">
            <Notifications unreadOnly={true} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

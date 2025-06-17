'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, Eye, Users, MessageSquare, Search } from 'lucide-react';

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  recipeVisibility: 'public' | 'friends' | 'private';
  allowFollowRequests: boolean;
  showActivity: boolean;
  allowDirectMessages: boolean;
  discoverable: boolean;
}

interface PrivacySettingsProps {
  userId: string;
}

export default function PrivacySettings({ userId }: PrivacySettingsProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    recipeVisibility: 'public',
    allowFollowRequests: true,
    showActivity: true,
    allowDirectMessages: true,
    discoverable: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, [userId]);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/privacy`);

      if (response.ok) {
        const data = await response.json();
        setSettings(data.privacySettings);
      } else {
        console.error('Failed to load privacy settings');
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/users/${userId}/privacy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Privacy settings updated successfully');
      } else {
        throw new Error('Failed to update privacy settings');
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast.error('Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (
    key: keyof PrivacySettings,
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            <div className="h-4 w-2/3 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>
          Control who can see your profile and interact with you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Visibility */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Profile Visibility
          </Label>
          <Select
            value={settings.profileVisibility}
            onValueChange={(value: 'public' | 'friends' | 'private') =>
              updateSetting('profileVisibility', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                Public - Anyone can see your profile
              </SelectItem>
              <SelectItem value="friends">
                Friends - Only people you follow can see your profile
              </SelectItem>
              <SelectItem value="private">
                Private - Only you can see your profile
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recipe Visibility */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recipe Visibility
          </Label>
          <Select
            value={settings.recipeVisibility}
            onValueChange={(value: 'public' | 'friends' | 'private') =>
              updateSetting('recipeVisibility', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                Public - Anyone can see your recipes
              </SelectItem>
              <SelectItem value="friends">
                Friends - Only people you follow can see your recipes
              </SelectItem>
              <SelectItem value="private">
                Private - Only you can see your recipes
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Allow Follow Requests */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Allow Follow Requests</Label>
            <p className="text-muted-foreground text-sm">
              Allow other users to follow you
            </p>
          </div>
          <Switch
            checked={settings.allowFollowRequests}
            onCheckedChange={(checked: boolean) =>
              updateSetting('allowFollowRequests', checked)
            }
          />
        </div>

        {/* Show Activity */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Show Activity</Label>
            <p className="text-muted-foreground text-sm">
              Show your activity (likes, comments) to followers
            </p>
          </div>
          <Switch
            checked={settings.showActivity}
            onCheckedChange={(checked: boolean) =>
              updateSetting('showActivity', checked)
            }
          />
        </div>

        {/* Allow Direct Messages */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Allow Direct Messages
            </Label>
            <p className="text-muted-foreground text-sm">
              Allow other users to send you direct messages
            </p>
          </div>
          <Switch
            checked={settings.allowDirectMessages}
            onCheckedChange={(checked: boolean) =>
              updateSetting('allowDirectMessages', checked)
            }
          />
        </div>

        {/* Discoverable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Discoverable
            </Label>
            <p className="text-muted-foreground text-sm">
              Allow others to find you in search results
            </p>
          </div>
          <Switch
            checked={settings.discoverable}
            onCheckedChange={(checked: boolean) =>
              updateSetting('discoverable', checked)
            }
          />
        </div>

        {/* Save Button */}
        <div className="border-t pt-4">
          <Button
            onClick={savePrivacySettings}
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

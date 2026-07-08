'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast-store';
import { getNotificationSettings, updateNotificationSettings } from '@/services/notifications';
import { NotificationSettings } from '@/types';

export function NotificationPreferences() {
  const { profile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      loadSettings();
    }
  }, [profile]);

  const loadSettings = async () => {
    setIsLoading(true);
    const { settings: data } = await getNotificationSettings(profile?.user_id || '');
    setSettings(data);
    setIsLoading(false);
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings || !profile) return;
    setIsSaving(true);
    try {
      const { error } = await updateNotificationSettings(profile.user_id, settings);
      if (error) {
        toast.error('Failed to save', error);
        return;
      }
      toast.success('Notification preferences updated');
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Channels</h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings?.email_notifications ?? true}
              onCheckedChange={() => handleToggle('email_notifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings?.push_notifications ?? true}
              onCheckedChange={() => handleToggle('push_notifications')}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Notifications</h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="item-matches">Item Matches</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when a potential match is found for your lost item
              </p>
            </div>
            <Switch
              id="item-matches"
              checked={settings?.item_matches ?? true}
              onCheckedChange={() => handleToggle('item_matches')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="item-updates">Item Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about changes to your reported items
              </p>
            </div>
            <Switch
              id="item-updates"
              checked={settings?.item_updates ?? true}
              onCheckedChange={() => handleToggle('item_updates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="messages">Messages</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you receive new messages
              </p>
            </div>
            <Switch
              id="messages"
              checked={settings?.messages ?? true}
              onCheckedChange={() => handleToggle('messages')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive tips, updates, and promotional content
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={settings?.marketing_emails ?? false}
              onCheckedChange={() => handleToggle('marketing_emails')}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast-store';
import { getPrivacySettings, updatePrivacySettings } from '@/services/settings';
import { PrivacySettings } from '@/types';

export function PrivacySettingsCard() {
  const { profile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      loadSettings();
    }
  }, [profile]);

  const loadSettings = async () => {
    setIsLoading(true);
    const { settings: data } = await getPrivacySettings(profile?.user_id || '');
    setSettings(data);
    setIsLoading(false);
  };

  const handleToggle = (key: keyof PrivacySettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings || !profile) return;
    setIsSaving(true);
    try {
      const { error } = await updatePrivacySettings(profile.user_id, settings);
      if (error) {
        toast.error('Failed to save', error);
        return;
      }
      toast.success('Privacy settings updated');
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
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control what information is visible to other users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="profile-visible">Public Profile</Label>
            <p className="text-sm text-muted-foreground">
              Allow others to view your profile
            </p>
          </div>
          <Switch
            id="profile-visible"
            checked={settings?.profile_visible ?? true}
            onCheckedChange={() => handleToggle('profile_visible')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-email">Show Email</Label>
            <p className="text-sm text-muted-foreground">
              Display your email on your profile
            </p>
          </div>
          <Switch
            id="show-email"
            checked={settings?.show_email ?? false}
            onCheckedChange={() => handleToggle('show_email')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-phone">Show Phone</Label>
            <p className="text-sm text-muted-foreground">
              Display your phone number on your profile
            </p>
          </div>
          <Switch
            id="show-phone"
            checked={settings?.show_phone ?? false}
            onCheckedChange={() => handleToggle('show_phone')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-location">Show Location</Label>
            <p className="text-sm text-muted-foreground">
              Display your country and city on your profile
            </p>
          </div>
          <Switch
            id="show-location"
            checked={settings?.show_location ?? true}
            onCheckedChange={() => handleToggle('show_location')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-activity">Show Activity</Label>
            <p className="text-sm text-muted-foreground">
              Display your activity stats (items found, returned, etc.)
            </p>
          </div>
          <Switch
            id="show-activity"
            checked={settings?.show_activity ?? true}
            onCheckedChange={() => handleToggle('show_activity')}
          />
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

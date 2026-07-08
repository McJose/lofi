'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { profileSchema, type ProfileFormData } from '@/validation/profile';
import { updateProfile, uploadAvatar } from '@/services/profiles';
import { useAuthStore } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast-store';
import { COUNTRIES } from '@/config';

interface ProfileEditFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ onSuccess, onCancel }: ProfileEditFormProps) {
  const { profile, setProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      phone: profile?.phone || '',
      country: profile?.country || '',
      city: profile?.city || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) return;

    setIsLoading(true);
    try {
      // Upload avatar if selected
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        const { url, error } = await uploadAvatar(profile.user_id, avatarFile);
        if (error) {
          toast.error('Upload failed', error);
        } else {
          avatarUrl = url;
        }
      }

      // Update profile
      const { profile: updatedProfile, error } = await updateProfile({
        userId: profile.user_id,
        data: {
          ...data,
          avatar_url: avatarUrl,
        },
      });

      if (error) {
        toast.error('Update failed', error);
        return;
      }

      setProfile(updatedProfile);
      toast.success('Profile updated', 'Your profile has been successfully updated.');
      onSuccess?.();
    } catch (error) {
      toast.error('Something went wrong', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File too large', 'Avatar must be less than 2MB');
        return;
      }
      setAvatarFile(file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {avatarFile ? (
              <img
                src={URL.createObjectURL(avatarFile)}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {profile?.full_name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
        </div>
        <div>
          <Button type="button" variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Change Avatar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </Button>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            {...register('full_name')}
            disabled={isLoading}
          />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            {...register('username')}
            disabled={isLoading}
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us a bit about yourself..."
          {...register('bio')}
          disabled={isLoading}
          rows={3}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          {...register('phone')}
          disabled={isLoading}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            defaultValue={profile?.country || ''}
            onValueChange={(value) => setValue('country', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.name}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Your city"
            {...register('city')}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

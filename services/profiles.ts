import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import type { ProfileFormData } from '@/validation/profile';

export interface UpdateProfileParams {
  userId: string;
  data: Partial<ProfileFormData>;
}

export async function updateProfile({ userId, data }: UpdateProfileParams): Promise<{ profile: Profile | null; error?: string }> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: profile as Profile };
}

export async function getProfileByUsername(username: string): Promise<{ profile: Profile | null; error?: string }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data as Profile | null };
}

export async function checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    return { available: false, error: error.message };
  }

  return { available: data === null };
}

export async function uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error?: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      upsert: true,
    });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

  // Update profile with new avatar URL
  await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('user_id', userId);

  return { url: data.publicUrl };
}

export async function incrementReputation(userId: string, points: number): Promise<{ error?: string }> {
  const { error } = await supabase.rpc('increment_reputation', {
    user_id: userId,
    points,
  });

  return { error: error?.message };
}

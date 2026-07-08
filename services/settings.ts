import { supabase } from '@/lib/supabase';
import type { PrivacySettings } from '@/types';

export async function getPrivacySettings(userId: string): Promise<{ settings: PrivacySettings | null; error?: string }> {
  const { data, error } = await supabase
    .from('privacy_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { settings: null, error: error.message };
  }

  // Create default settings if none exist
  if (!data) {
    const { data: newSettings, error: createError } = await supabase
      .from('privacy_settings')
      .insert({ user_id: userId })
      .select()
      .single();

    if (createError) {
      return { settings: null, error: createError.message };
    }

    return { settings: newSettings as PrivacySettings };
  }

  return { settings: data as PrivacySettings };
}

export async function updatePrivacySettings(
  userId: string,
  settings: Partial<PrivacySettings>
): Promise<{ settings: PrivacySettings | null; error?: string }> {
  const { data, error } = await supabase
    .from('privacy_settings')
    .upsert({ user_id: userId, ...settings })
    .select()
    .single();

  if (error) {
    return { settings: null, error: error.message };
  }

  return { settings: data as PrivacySettings };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ error?: string }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error: error?.message };
}

export async function deleteAccount(userId: string): Promise<{ error?: string }> {
  // First delete all user data
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('user_id', userId);

  if (profileError) {
    return { error: profileError.message };
  }

  // Then sign out
  await supabase.auth.signOut();

  return {};
}

export async function updateEmail(newEmail: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  return { error: error?.message };
}

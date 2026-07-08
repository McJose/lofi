import { supabase } from '@/lib/supabase';
import type { Notification, NotificationSettings } from '@/types';

export interface CreateNotificationParams {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  actionUrl?: string;
}

export async function createNotification(params: CreateNotificationParams): Promise<{ notification: Notification | null; error?: string }> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      action_url: params.actionUrl,
    })
    .select()
    .single();

  if (error) {
    return { notification: null, error: error.message };
  }

  return { notification: data as Notification };
}

export async function getNotifications(userId: string, limit = 20, offset = 0): Promise<{ notifications: Notification[]; error?: string }> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return { notifications: [], error: error.message };
  }

  return { notifications: data as Notification[] };
}

export async function getUnreadNotifications(userId: string): Promise<{ notifications: Notification[]; count: number; error?: string }> {
  const { data, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false });

  if (error) {
    return { notifications: [], count: 0, error: error.message };
  }

  return { notifications: data as Notification[], count: count || 0 };
}

export async function markNotificationAsRead(notificationId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  return { error: error?.message };
}

export async function markAllNotificationsAsRead(userId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  return { error: error?.message };
}

export async function deleteNotification(notificationId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  return { error: error?.message };
}

export async function getNotificationSettings(userId: string): Promise<{ settings: NotificationSettings | null; error?: string }> {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { settings: null, error: error.message };
  }

  // Create default settings if none exist
  if (!data) {
    const { data: newSettings, error: createError } = await supabase
      .from('notification_settings')
      .insert({ user_id: userId })
      .select()
      .single();

    if (createError) {
      return { settings: null, error: createError.message };
    }

    return { settings: newSettings as NotificationSettings };
  }

  return { settings: data as NotificationSettings };
}

export async function updateNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>
): Promise<{ settings: NotificationSettings | null; error?: string }> {
  const { data, error } = await supabase
    .from('notification_settings')
    .upsert({ user_id: userId, ...settings })
    .select()
    .single();

  if (error) {
    return { settings: null, error: error.message };
  }

  return { settings: data as NotificationSettings };
}

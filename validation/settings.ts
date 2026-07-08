import { z } from 'zod';

export const accountSettingsSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

export type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>;

export const privacySettingsSchema = z.object({
  profile_visible: z.boolean(),
  show_email: z.boolean(),
  show_phone: z.boolean(),
  show_location: z.boolean(),
  show_activity: z.boolean(),
});

export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>;

export const notificationSettingsSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  marketing_emails: z.boolean(),
  item_matches: z.boolean(),
  item_updates: z.boolean(),
  messages: z.boolean(),
});

export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

export const securitySettingsSchema = z.object({
  current_password: z.string().min(8, 'Password must be at least 8 characters'),
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirm_new_password: z.string(),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: "Passwords don't match",
  path: ['confirm_new_password'],
});

export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;

export const themeSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
});

export type ThemeSettingsFormData = z.infer<typeof themeSettingsSchema>;

import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  phone: z.string().optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  avatar_url: z.string().url().optional().nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const avatarUploadSchema = z.object({
  file: z.custom<File>((file) => file instanceof File, 'Invalid file'),
  maxSize: z.number().optional(),
  allowedTypes: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.file && data.maxSize && data.file.size > data.maxSize) {
    return false;
  }
  return true;
}, {
  message: 'File size exceeds maximum allowed',
});

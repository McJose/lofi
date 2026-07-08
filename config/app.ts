export const APP_CONFIG = {
  name: 'FindBack',
  tagline: 'Helping Lost Things Find Their Way Home',
  description: 'FindBack is a platform that helps people recover their lost items by connecting finders with owners through a secure and easy-to-use system.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '1.0.0',
  founder: {
    name: 'Joseph Makau',
    portfolio: 'https://macjose.netlify.app',
  },
  contact: {
    email: 'support@findback.app',
  },
  social: {
    twitter: 'https://twitter.com/findback',
    facebook: 'https://facebook.com/findback',
    instagram: 'https://instagram.com/findback',
  },
} as const;

export const AUTH_CONFIG = {
  passwordMinLength: 8,
  passwordMaxLength: 128,
  sessionTimeoutMinutes: 60,
  refreshTokenExpiryDays: 7,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  otpExpiryMinutes: 5,
  emailVerificationExpiryHours: 24,
  passwordResetExpiryHours: 1,
} as const;

export const STORAGE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  avatarMaxSize: 2 * 1024 * 1024, // 2MB
  avatarDimensions: { width: 400, height: 400 },
} as const;

export const PAGINATION_CONFIG = {
  defaultPerPage: 20,
  maxPerPage: 100,
} as const;

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
] as const;

export const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'sw', name: 'Kiswahili' },
] as const;

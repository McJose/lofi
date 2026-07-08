// Auth Types
export type UserRole = 'guest' | 'user' | 'moderator' | 'admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  phone?: string | null;
  phone_verified: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  reputation_score: number;
  verification_badge: boolean;
  items_reported: number;
  items_found: number;
  items_returned: number;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  full_name: string;
  username: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  password: string;
  token: string;
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationChannel = 'in_app' | 'email' | 'push';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  action_url?: string | null;
  created_at: string;
}

export interface NotificationSettings {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  item_matches: boolean;
  item_updates: boolean;
  messages: boolean;
  created_at: string;
  updated_at: string;
}

// Settings Types
export interface AccountSettings {
  email: string;
  phone?: string | null;
  full_name: string;
  username: string;
}

export interface PrivacySettings {
  user_id: string;
  profile_visible: boolean;
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  show_activity: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
  accent_color: string;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  last_password_change?: string | null;
  active_sessions: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  per_page: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: ResponseMeta;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

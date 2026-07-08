import { supabase } from '@/lib/supabase';
import type { LoginFormData, SignupFormData, ForgotPasswordFormData, ResetPasswordFormData } from '@/validation/auth';
import type { User, Profile, Session } from '@/types';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: string;
}

// Helper to get user role from app metadata
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUserRole(appMetadata: any): User['role'] {
  const role = appMetadata?.role;
  if (role && ['user', 'moderator', 'admin', 'super_admin'].includes(role)) {
    return role;
  }
  return 'user';
}

// Map Supabase user to app User type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    email_verified: !!supabaseUser.email_confirmed_at,
    phone: supabaseUser.phone || null,
    phone_verified: !!supabaseUser.phone_confirmed_at,
    role: getUserRole(supabaseUser.app_metadata || {}),
    created_at: supabaseUser.created_at || new Date().toISOString(),
    updated_at: supabaseUser.updated_at || new Date().toISOString(),
    last_sign_in_at: supabaseUser.last_sign_in_at || null,
  };
}

// Map Supabase session to app Session type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSession(supabaseSession: any): Session {
  return {
    access_token: supabaseSession.access_token,
    refresh_token: supabaseSession.refresh_token,
    expires_at: supabaseSession.expires_at || Math.floor(Date.now() / 1000) + supabaseSession.expires_in,
    expires_in: supabaseSession.expires_in,
    token_type: supabaseSession.token_type,
  };
}

// Login with email/password
export async function loginWithEmail(data: LoginFormData): Promise<AuthResponse> {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return {
      user: null,
      session: null,
      error: error.message,
    };
  }

  return {
    user: authData.user ? mapUser(authData.user) : null,
    session: authData.session ? mapSession(authData.session) : null,
  };
}

// Sign up with email/password
export async function signUpWithEmail(data: SignupFormData): Promise<AuthResponse & { profile?: Profile }> {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.full_name,
        username: data.username,
      },
    },
  });

  if (error) {
    return {
      user: null,
      session: null,
      error: error.message,
    };
  }

  // Create profile
  let profile: Profile | undefined;
  if (authData.user) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: data.email,
        username: data.username,
        full_name: data.full_name,
      })
      .select()
      .single();

    if (!profileError) {
      profile = profileData as Profile;
    }
  }

  return {
    user: authData.user ? mapUser(authData.user) : null,
    session: authData.session ? mapSession(authData.session) : null,
    profile,
  };
}

// Sign in with Google
export async function loginWithGoogle(): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  return { error: error?.message };
}

// Sign in with Apple
export async function loginWithApple(): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  return { error: error?.message };
}

// Sign in with phone OTP
export async function sendPhoneOTP(phone: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
  });

  return { error: error?.message };
}

// Verify phone OTP
export async function verifyPhoneOTP(phone: string, otp: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: 'sms',
  });

  if (error) {
    return {
      user: null,
      session: null,
      error: error.message,
    };
  }

  return {
    user: data.user ? mapUser(data.user) : null,
    session: data.session ? mapSession(data.session) : null,
  };
}

// Send password reset email
export async function forgotPassword(data: ForgotPasswordFormData): Promise<{ error?: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  return { error: error?.message };
}

// Reset password with token
export async function resetPassword(data: ResetPasswordFormData, accessToken: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  return { error: error?.message };
}

// Sign out
export async function signOut(): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message };
}

// Get current session
export async function getCurrentSession(): Promise<{ user: User | null; session: Session | null }> {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return { user: null, session: null };
  }

  return {
    user: session.user ? mapUser(session.user) : null,
    session: mapSession(session),
  };
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return mapUser(user);
}

// Refresh session
export async function refreshSession(): Promise<{ user: User | null; session: Session | null; error?: string }> {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  return {
    user: data.user ? mapUser(data.user) : null,
    session: data.session ? mapSession(data.session) : null,
  };
}

// Set session from access token (for OAuth callback)
export async function setSessionFromToken(accessToken: string, refreshToken: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    return {
      user: null,
      session: null,
      error: error.message,
    };
  }

  return {
    user: data.user ? mapUser(data.user) : null,
    session: data.session ? mapSession(data.session) : null,
  };
}

// Get user profile
export async function getUserProfile(userId: string): Promise<{ profile: Profile | null; error?: string }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data as Profile | null };
}

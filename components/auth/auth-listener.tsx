'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/use-auth';
import type { User, Session, Profile } from '@/types';

// Helper to map Supabase user to our User type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(user: any): User {
  const appMetadata = user.app_metadata || {};
  const role = appMetadata?.role;
  return {
    id: user.id,
    email: user.email || '',
    email_verified: !!user.email_confirmed_at,
    phone: user.phone || null,
    phone_verified: !!user.phone_confirmed_at,
    role: role && ['user', 'moderator', 'admin', 'super_admin'].includes(role)
      ? role
      : 'user',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString(),
    last_sign_in_at: user.last_sign_in_at || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSession(session: any): Session {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at || Math.floor(Date.now() / 1000) + session.expires_in,
    expires_in: session.expires_in,
    token_type: session.token_type,
  };
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

export function AuthListener() {
  const { setUser, setSession, setProfile, setLoading, setInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(mapUser(session.user));
          setSession(mapSession(session));
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Must wrap async work in immediately-invoked async function to avoid deadlock
      (async () => {
        if (session?.user) {
          setUser(mapUser(session.user));
          setSession(mapSession(session));
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
        }

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          router.refresh();
        } else if (event === 'SIGNED_OUT') {
          router.push('/');
          router.refresh();
        }
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setLoading, setInitialized, router]);

  return null;
}

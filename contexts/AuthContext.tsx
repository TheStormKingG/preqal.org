import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

/** Thrown when the auth host cannot be reached, so the UI can say so plainly. */
export const AUTH_UNREACHABLE = 'auth-unreachable';

const REACHABILITY_TIMEOUT_MS = 6000;

/* signInWithOAuth hands the whole tab to the auth host with a full-page
   redirect. If that host is unreachable the browser lands on its own error
   page and the reader is stranded there with no way back into the site — so
   check it answers before giving the tab away.
   A no-cors request resolves for any reachable host whatever it replies, and
   rejects only on a genuine network failure, which is exactly the signal we
   want. A timeout is not proof of anything, so that case fails open. */
async function authHostReachable(): Promise<boolean> {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return true;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REACHABILITY_TIMEOUT_MS);
  try {
    await fetch(`${base}/auth/v1/health`, {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    return true;
  } catch {
    return controller.signal.aborted; // timed out — let the normal flow proceed
  } finally {
    window.clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EcourseProfile {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: EcourseProfile | null;
  /** true while the initial session check is in flight */
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Save (or update) the display name — call after the user edits their name on the register page */
  upsertProfile: (displayName: string) => Promise<void>;
  /** Re-fetch (or auto-create) the profile for the currently signed-in user */
  refreshProfile: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  upsertProfile: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ---------------------------------------------------------------------------
// Helpers (outside the component so they can be called freely)
// ---------------------------------------------------------------------------

async function dbUpsertProfile(
  id: string,
  displayName: string,
  email: string,
  avatarUrl?: string | null,
): Promise<void> {
  const { error } = await supabase.from('ecourse_profiles').upsert({
    id,
    display_name: displayName,
    email,
    avatar_url: avatarUrl ?? null,
    updated_at: new Date().toISOString(),
  });
  // supabase-js never throws — surface write failures so callers can react
  if (error) throw error;
}

async function dbFetchProfile(userId: string): Promise<EcourseProfile | null> {
  const { data } = await supabase
    .from('ecourse_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return (data as EcourseProfile | null) ?? null;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<EcourseProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAndSetProfile = useCallback(async (userId: string): Promise<EcourseProfile | null> => {
    const p = await dbFetchProfile(userId);
    setProfile(p);
    return p;
  }, []);

  useEffect(() => {
    // Shared helper: load profile and auto-create from Google metadata if missing
    const ensureProfile = async (u: import('@supabase/supabase-js').User): Promise<void> => {
      const existing = await loadAndSetProfile(u.id);
      if (!existing) {
        const displayName =
          (u.user_metadata?.full_name as string | undefined) ||
          (u.user_metadata?.name as string | undefined) ||
          u.email?.split('@')[0] ||
          'Student';
        await dbUpsertProfile(
          u.id,
          displayName,
          u.email ?? '',
          u.user_metadata?.avatar_url as string | undefined,
        );
        await loadAndSetProfile(u.id);
      }
    };

    // Restore session on mount — auto-create profile if it's missing
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        ensureProfile(u).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Subscribe to auth state changes (handles OAuth callback too)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        ensureProfile(u)
          .catch(() => { /* profile stays null; user can retry */ })
          .finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadAndSetProfile]);

  const signInWithGoogle = useCallback(async () => {
    if (!(await authHostReachable())) throw new Error(AUTH_UNREACHABLE);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/e-courses/register`,
      },
    });
    if (error) throw error; // was silently discarded, so failures showed nothing
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const upsertProfile = useCallback(
    async (displayName: string) => {
      if (!user) return;
      await dbUpsertProfile(
        user.id,
        displayName,
        user.email ?? '',
        user.user_metadata?.avatar_url as string | undefined,
      );
      await loadAndSetProfile(user.id);
    },
    [user, loadAndSetProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const existing = await loadAndSetProfile(user.id);
    if (!existing) {
      const displayName =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        user.email?.split('@')[0] ||
        'Student';
      await dbUpsertProfile(
        user.id,
        displayName,
        user.email ?? '',
        user.user_metadata?.avatar_url as string | undefined,
      );
      await loadAndSetProfile(user.id);
    }
  }, [user, loadAndSetProfile]);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signInWithGoogle, signOut: handleSignOut, upsertProfile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

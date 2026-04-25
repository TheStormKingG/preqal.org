import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type EcourseRegistrationRow = {
  holder_legal_name: string;
  course_slug: string;
  terms_accepted_at: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  registration: EcourseRegistrationRow | null;
  regLoading: boolean;
  refreshRegistration: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<EcourseRegistrationRow | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  const loadRegistration = useCallback(async (uid: string) => {
    setRegLoading(true);
    const { data, error } = await supabase
      .from('ecourse_course_registrations')
      .select('holder_legal_name, course_slug, terms_accepted_at')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) {
      setRegistration(null);
    } else {
      setRegistration((data as EcourseRegistrationRow | null) ?? null);
    }
    setRegLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (cancelled) return;
      setSession(s);
      setLoading(false);
      if (s?.user) void loadRegistration(s.user.id);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s?.user) {
        setRegistration(null);
        return;
      }
      void loadRegistration(s.user.id);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadRegistration]);

  const refreshRegistration = useCallback(async () => {
    const uid = session?.user?.id;
    if (uid) await loadRegistration(uid);
  }, [loadRegistration, session?.user?.id]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/e-courses/register`,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) console.error(error);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRegistration(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      registration,
      regLoading,
      refreshRegistration,
      signInWithGoogle,
      signOut,
    }),
    [session, loading, registration, regLoading, refreshRegistration, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

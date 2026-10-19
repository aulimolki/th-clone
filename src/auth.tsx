import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (!error && data) {
      setProfile(data as Profile);
    } else if (error) {
      setProfile(null);
    } else if (!data) {
      // Profile row doesn't exist yet; create a minimal one from metadata.
      const { data: userData } = await supabase.auth.getUser();
      const meta = userData?.user?.user_metadata ?? {};
      const fullName = (meta.full_name as string) || (meta.name as string) || null;
      const avatarUrl = (meta.avatar_url as string) || (meta.picture as string) || null;
      const { data: inserted } = await supabase
        .from('profiles')
        .insert({ id: uid, full_name: fullName, avatar_url: avatarUrl })
        .select('*')
        .maybeSingle();
      if (inserted) setProfile(inserted as Profile);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        fetchProfile(data.session.user.id).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = useCallback<AuthContextValue['signUp']>(async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName ?? '' } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      // Create profile row immediately for the new user.
      await supabase
        .from('profiles')
        .upsert({ id: data.user.id, full_name: fullName ?? null })
        .select('*')
        .maybeSingle();
    }
    return { error: null };
  }, []);

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signInWithGoogle = useCallback<AuthContextValue['signInWithGoogle']>(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async (updates) => {
      if (!session?.user) return { error: 'Not signed in' };
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);
      if (error) return { error: error.message };
      await fetchProfile(session.user.id);
      return { error: null };
    },
    [session, fetchProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (session?.user) await fetchProfile(session.user.id);
  }, [session, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  initializing: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // On web, Supabase's detectSessionInUrl handles the hash fragment automatically.
    // But we also handle PKCE flow (code in query params) as a fallback.
    const handleWebRedirect = async () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.warn('Code exchange failed:', error.message);
          }
          // Clean the URL after exchanging the code
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    };

    handleWebRedirect().then(() => {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setInitializing(false);
      });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setInitializing(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const user = session?.user;
    if (!user) return;

    const username = user.email?.split('@')[0] ?? 'reader';
    supabase
      .from('users')
      .upsert({ id: user.id, username }, { onConflict: 'id', ignoreDuplicates: true })
      .then(({ error }) => {
        if (error) console.warn('Profile bootstrap failed', error.message);
      });
  }, [session?.user]);

  const value = useMemo(() => ({ session, initializing }), [session, initializing]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

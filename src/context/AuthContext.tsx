import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
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

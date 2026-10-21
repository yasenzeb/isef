/**
 * AuthContext.tsx — Supabase-powered Authentication Context
 * Supports:
 *   1. Magic Link (OTP email) — works immediately with ministry emails
 *   2. Microsoft OAuth (Azure AD) — enabled after Supabase Azure config
 */

import React, {
  createContext, useContext, useEffect, useState, useCallback, useRef,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  supabase,
  detectRoleFromEmail,
  type SciNexaProfile,
  type UserRole,
} from '../lib/supabase';

// Re-export for consumers
export type { SciNexaProfile, UserRole };

// ─── Context shape ───────────────────────────────────────────────────────────
interface AuthContextValue {
  user:              SciNexaProfile | null;
  session:           Session | null;
  isLoading:         boolean;
  isAuthenticated:   boolean;
  /** Send magic-link to ministry email */
  sendMagicLink:     (email: string) => Promise<{ error: string | null }>;
  /** OAuth login via Microsoft (requires Supabase Azure provider config) */
  loginWithMicrosoft: () => Promise<{ error: string | null }>;
  logout:            () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ─── Build SciNexaProfile from Supabase User ─────────────────────────────────
function buildProfile(user: User): SciNexaProfile {
  const email      = user.email ?? '';
  const meta       = user.user_metadata ?? {};
  const roleMeta   = detectRoleFromEmail(email);

  // Microsoft OAuth fills user_metadata with name, full_name, etc.
  const displayName =
    meta.full_name    ||
    meta.name         ||
    meta.display_name ||
    email.split('@')[0];

  return {
    id:          user.id,
    email,
    displayName,
    avatarUrl:   meta.avatar_url || meta.picture || undefined,
    createdAt:   user.created_at,
    ...roleMeta,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session,   setSession]   = useState<Session | null>(null);
  const [user,      setUser]      = useState<SciNexaProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // 1. Get initial session (handles magic-link hash automatically)
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted.current) return;
      if (data.session?.user) {
        setSession(data.session);
        setUser(buildProfile(data.session.user));
      }
      setIsLoading(false);
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted.current) return;
        setSession(newSession);
        setUser(newSession?.user ? buildProfile(newSession.user) : null);
        setIsLoading(false);
      }
    );

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Send Magic Link ─────────────────────────────────────────────────────
  const sendMagicLink = useCallback(async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: true,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  // ── Microsoft OAuth ─────────────────────────────────────────────────────
  const loginWithMicrosoft = useCallback(async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes:      'email profile openid User.Read',
        redirectTo:  window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated: !!session,
      sendMagicLink,
      loginWithMicrosoft,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

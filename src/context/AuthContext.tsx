/**
 * AuthContext.tsx — Comprehensive Institutional Authentication Context
 * Supports:
 *   1. Direct Email + Password Login (Immediate, no email confirmation required)
 *   2. Account Registration with full profile (Name, Age, Birthday, Gender, Ministry Role)
 *   3. Microsoft SSO (Azure AD OAuth) as an alternate enterprise method
 *   4. Instant session persistence & auto-profile hydration
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

export type { SciNexaProfile, UserRole };

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  age?: number;
  birthday?: string;
  gender?: 'male' | 'female';
}

interface AuthContextValue {
  user: SciNexaProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (params: SignUpParams) => Promise<{ error: string | null }>;
  loginWithMicrosoft: () => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ── Build Profile from Supabase User ─────────────────────────────────────────
function buildProfile(user: User): SciNexaProfile {
  const email = user.email ?? '';
  const meta = user.user_metadata ?? {};
  const roleMeta = detectRoleFromEmail(email);

  const displayName =
    meta.full_name ||
    meta.name ||
    meta.display_name ||
    email.split('@')[0];

  return {
    id: user.id,
    email,
    displayName,
    role: meta.role || roleMeta.role,
    schoolCode: meta.school_code || roleMeta.schoolCode,
    studentCode: meta.student_code || roleMeta.studentCode,
    governorate: meta.governorate || roleMeta.governorate,
    age: meta.age ? Number(meta.age) : undefined,
    birthday: meta.birthday || undefined,
    gender: meta.gender || undefined,
    avatarUrl: meta.avatar_url || meta.picture || undefined,
    createdAt: user.created_at,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SciNexaProfile | null>(() => {
    try {
      const cached = localStorage.getItem('scinexa_cached_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  // Sync profile to localStorage for instant offline access
  const syncProfile = useCallback((newProfile: SciNexaProfile | null) => {
    setUser(newProfile);
    try {
      if (newProfile) {
        localStorage.setItem('scinexa_cached_profile', JSON.stringify(newProfile));
      } else {
        localStorage.removeItem('scinexa_cached_profile');
      }
    } catch {}
  }, []);

  useEffect(() => {
    mounted.current = true;

    // 1. Initial session check
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted.current) return;
      if (data.session?.user) {
        setSession(data.session);
        syncProfile(buildProfile(data.session.user));
      } else {
        setSession(null);
        syncProfile(null);
      }
      setIsLoading(false);
    });

    // 2. Real-time auth changes listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted.current) return;
        setSession(newSession);
        syncProfile(newSession?.user ? buildProfile(newSession.user) : null);
        setIsLoading(false);
      }
    );

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [syncProfile]);

  // ── Login with Email & Password ───────────────────────────────────────────
  const loginWithPassword = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Map common errors to friendly Arabic messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: 'يرجى مراجعة إعدادات تأكيد البريد في Supabase (Confirm Email = OFF).' };
        }
        return { error: error.message };
      }

      if (data.user) {
        setSession(data.session);
        syncProfile(buildProfile(data.user));
      }
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'حدث خطأ في الاتصال بالخادم.' };
    }
  }, [syncProfile]);

  // ── Sign Up with Full Profile ─────────────────────────────────────────────
  const signUpWithPassword = useCallback(async (params: SignUpParams): Promise<{ error: string | null }> => {
    try {
      const cleanEmail = params.email.trim().toLowerCase();
      const detected = detectRoleFromEmail(cleanEmail);

      const metadata = {
        full_name: params.name.trim(),
        role: detected.role,
        school_code: detected.schoolCode,
        student_code: detected.studentCode,
        governorate: detected.governorate,
        age: params.age,
        birthday: params.birthday,
        gender: params.gender,
      };

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          return { error: 'هذا الحساب مسجل بالفعل! يرجى تسجيل الدخول.' };
        }
        if (error.message.includes('Password should be at least')) {
          return { error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.' };
        }
        return { error: error.message };
      }

      // If Supabase has confirm email off, data.session is returned immediately
      if (data.session && data.user) {
        setSession(data.session);
        syncProfile(buildProfile(data.user));
      } else if (data.user) {
        // Session might be auto-created or auto signed in
        const loginRes = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: params.password,
        });
        if (loginRes.data.user) {
          setSession(loginRes.data.session);
          syncProfile(buildProfile(loginRes.data.user));
        }
      }

      // Sync into profiles table asynchronously
      if (data.user) {
        (async () => {
          try {
            await supabase.from('profiles').upsert({
              id: data.user!.id,
              email: cleanEmail,
              display_name: params.name.trim(),
              role: detected.role,
              school_code: detected.schoolCode,
              student_code: detected.studentCode,
              governorate: detected.governorate,
              age: params.age,
              birthday: params.birthday,
              gender: params.gender,
            });
          } catch {}
        })();
      }

      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'حدث خطأ أثناء إنشاء الحساب.' };
    }
  }, [syncProfile]);

  // ── Microsoft OAuth ───────────────────────────────────────────────────────
  const loginWithMicrosoft = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email profile openid User.Read',
          redirectTo: window.location.origin,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'تعذر بدء تسجيل الدخول بحساب مايكروسوفت.' };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    syncProfile(null);
  }, [syncProfile]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated: !!user || !!session,
      loginWithPassword,
      signUpWithPassword,
      loginWithMicrosoft,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

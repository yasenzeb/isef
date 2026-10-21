/**
 * AuthContext.tsx — Comprehensive Institutional Authentication Context
 * Supports:
 *   1. Direct Email + Password Login
 *   2. Account Registration with full profile (Name, Age, Birthday, Gender, Ministry Role)
 *   3. Google One-Click SSO
 *   4. Microsoft Office 365 Enterprise SSO
 *   5. Institutional Password Reset (Verification by Student Code & Directorate without email inbox)
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

export interface ResetPasswordParams {
  email: string;
  studentCode: string;
  governorate: string;
  newPassword: string;
}

interface AuthContextValue {
  user: SciNexaProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (params: SignUpParams) => Promise<{ error: string | null }>;
  loginWithMicrosoft: () => Promise<{ error: string | null }>;
  loginWithGoogle: () => Promise<{ error: string | null }>;
  resetPasswordWithInstitutionalVerification: (params: ResetPasswordParams) => Promise<{ error: string | null; message?: string }>;
  continueAsGuest: () => void;
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

  const numCode = email.match(/^(\d+)/)?.[1];

  return {
    id: user.id,
    email,
    displayName,
    role: meta.role || roleMeta.role,
    schoolCode: meta.school_code || roleMeta.schoolCode,
    studentCode: meta.student_code || roleMeta.studentCode || numCode,
    governorate: meta.governorate || roleMeta.governorate,
    governorateAr: roleMeta.governorateAr || meta.governorate_ar,
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

    // Handle OAuth callbacks — Supabase can return:
    //   PKCE flow: ?code=xxx  (Google, Microsoft via redirectTo)
    //   Implicit flow: #access_token=xxx (legacy hash fragment)
    const urlParams  = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const oauthCode  = urlParams.get('code');
    const hashToken  = hashParams.get('access_token');

    if (hashToken) {
      // Implicit flow — Supabase SDK reads hash automatically; just clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Session will be picked up by getSession() below
    }

    if (oauthCode) {
      // PKCE flow — manually exchange code for session
      setIsLoading(true);
      supabase.auth.exchangeCodeForSession(oauthCode)
        .then(({ data, error: exchErr }) => {
          if (!mounted.current) return;
          if (exchErr) {
            console.warn('[SciNexa OAuth] exchangeCodeForSession failed:', exchErr.message);
          }
          if (!exchErr && data?.session?.user) {
            setSession(data.session);
            syncProfile(buildProfile(data.session.user));
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsLoading(false);
            return;
          }
          // Exchange failed — check if session already exists (supabase may have handled it)
          supabase.auth.getSession().then(({ data: sd }) => {
            if (!mounted.current) return;
            if (sd.session?.user) {
              setSession(sd.session);
              syncProfile(buildProfile(sd.session.user));
            } else {
              setSession(null);
              syncProfile(null);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsLoading(false);
          });
        })
        .catch(() => {
          if (mounted.current) {
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsLoading(false);
          }
        });
    } else {
      // Normal load — check existing session
      supabase.auth.getSession().then(({ data }) => {
        if (!mounted.current) return;
        if (data.session?.user) {
          setSession(data.session);
          syncProfile(buildProfile(data.session.user));
        } else {
          // Preserve guest mode if active
          const cached = localStorage.getItem('scinexa_cached_profile');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed?.isGuest) {
                setUser(parsed);
                setIsLoading(false);
                return;
              }
            } catch {}
          }
          setSession(null);
          syncProfile(null);
        }
        setIsLoading(false);
      });
    }

    // Real-time auth state listener (fires on sign-in / sign-out / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted.current) return;
        if (newSession?.user) {
          setSession(newSession);
          syncProfile(buildProfile(newSession.user));
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setIsLoading(false);
        }
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
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
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
        governorate_ar: detected.governorateAr,
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
          return { error: 'هذا الحساب مسجل بالفعل! يرجى تسجيل الدخول أو استعادة كلمة المرور.' };
        }
        if (error.message.includes('Password should be at least')) {
          return { error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.' };
        }
        return { error: error.message };
      }

      if (data.session && data.user) {
        setSession(data.session);
        syncProfile(buildProfile(data.user));
      } else if (data.user) {
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

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: { prompt: 'select_account', access_type: 'offline' },
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'تعذر الاتصال بخدمة Google.' };
    }
  }, []);

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

  // ── Reset Password via Institutional Verification ─────────────────────────
  const resetPasswordWithInstitutionalVerification = useCallback(async (
    params: ResetPasswordParams
  ): Promise<{ error: string | null; message?: string }> => {
    try {
      const cleanEmail = params.email.trim().toLowerCase();
      const cleanCode = params.studentCode.trim();

      // Rule 1: Student Code must match numeric prefix of email (if present)
      const numMatch = cleanEmail.match(/^(\d+)/);
      if (numMatch && numMatch[1] !== cleanCode) {
        return {
          error: `كود الطالب المدخل (${cleanCode}) غير مطابق للكود الموضح في البريد الموحد (${numMatch[1]}).`
        };
      }

      // Rule 2: Minimum password length
      if (params.newPassword.length < 6) {
        return { error: 'كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف أو أرقام.' };
      }

      // 1. Try direct Supabase RPC function (works without any secret key if SQL function is created)
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('reset_student_password', {
          target_email: cleanEmail,
          target_code: cleanCode,
          new_password: params.newPassword,
        });

        if (!rpcError && rpcData?.success) {
          // Password updated in database! Sign in immediately
          const loginRes = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: params.newPassword,
          });

          if (loginRes.data.user) {
            setSession(loginRes.data.session);
            syncProfile(buildProfile(loginRes.data.user));
          }

          return { error: null, message: rpcData.message || 'تم تحديث كلمة المرور وتأكيد هويتك بنجاح!' };
        } else if (rpcData?.error) {
          return { error: rpcData.error };
        }
      } catch {}

      // 2. Fallback: Call serverless institutional reset endpoint
      const res = await fetch('/api/auth/institutional-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          studentCode: cleanCode,
          governorate: params.governorate,
          newPassword: params.newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        return { error: json.error || 'تعذر تحديث كلمة المرور.' };
      }

      // Attempt to immediately log the student in with the new password
      const loginRes = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: params.newPassword,
      });

      if (loginRes.data.user) {
        setSession(loginRes.data.session);
        syncProfile(buildProfile(loginRes.data.user));
      }

      return { error: null, message: json.message || 'تم تحديث كلمة المرور وتأكيد هويتك بنجاح!' };
    } catch (err: any) {
      return { error: err?.message || 'حدث خطأ في عملية استعادة الحساب.' };
    }
  }, [syncProfile]);

  // ── Continue as Guest (One-Click Instant Access) ──────────────────────────
  const continueAsGuest = useCallback(() => {
    const guestProfile: SciNexaProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      email: 'guest@scinexa.edu',
      displayName: 'زائر المنظومة',
      role: 'student',
      isGuest: true,
      governorateAr: 'جمهورية مصر العربية',
      gender: 'male',
    };
    syncProfile(guestProfile);
    setIsLoading(false);
  }, [syncProfile]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    syncProfile(null);
    try {
      localStorage.removeItem('scinexa_cached_profile');
    } catch {}
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
      loginWithGoogle,
      resetPasswordWithInstitutionalVerification,
      continueAsGuest,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';
import { isClerkConfigured } from '../lib/clerkConfig';
import { dbUpsertProfile, dbFetchProfileByEmail } from '../lib/supabase';
import { clearActiveSessionKeys, getScopedUserProfile, saveScopedUserProfile } from '../lib/userStorage';
import { getPersistedItem, setPersistedItem } from '../lib/cookies';

export type AppRole = 'student' | 'teacher' | 'admin';

export interface EducatorAuth {
  name: string;
  nationalId: string;
  role: 'teacher' | 'admin';
  schoolName?: string;
  schoolCode?: string;
  verifiedAt: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatarUrl?: string;
  isDemo: boolean;
  grade?: string;
}

interface SessionValue {
  user: SessionUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  role: AppRole;
  isDemo: boolean;
  isRolePreview: boolean;
  educator: EducatorAuth | null;
  loginEducator: (auth: EducatorAuth) => void;
  logoutEducator: () => void;
  signOut: () => Promise<void>;
  signInDemo: (input: { name: string; email: string; role: AppRole }) => void;
  switchDemoRole: (role: AppRole) => void;
  clearRolePreview: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

const DEMO_KEY = 'scinexa_demo_session';
export const EDUCATOR_AUTH_KEY = 'scinexa_educator_auth';

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}

export const readEducatorSession = (): EducatorAuth | null => {
  try {
    const raw = localStorage.getItem(EDUCATOR_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.role === 'teacher' || parsed.role === 'admin') && parsed.name) {
      return parsed as EducatorAuth;
    }
  } catch {
    /* ignore */
  }
  return null;
};

/* ── Clerk-backed session ─────────────────────────────────────────────────── */
const ClerkSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const location = useLocation();
  const [educator, setEducator] = useState<EducatorAuth | null>(readEducatorSession);

  // عزل تام: بوابة المعلمين والإدارة (/portal, /admin, /teacher) لا تتصل بجلسة Clerk الخاصة بالطلاب إطلاقاً
  const isEducatorPortal =
    location.pathname.startsWith('/portal') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/teacher');

  // في منصة الطلاب /app: المستخدم دائماً طالب (Student) ولا يملك صلاحية تغيير دوره
  const normalized: SessionUser | null = useMemo(() => {
    if (isEducatorPortal || !user) return null;
    return {
      id: user.id,
      name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress.split('@')[0] || 'Student',
      email: user.primaryEmailAddress?.emailAddress ?? '',
      role: 'student',
      avatarUrl: user.imageUrl,
      isDemo: false,
      grade: String((user.publicMetadata as Record<string, unknown> | undefined)?.grade ?? '') || undefined,
    };
  }, [user, isEducatorPortal]);

  useEffect(() => {
    if (isEducatorPortal || !normalized?.email) return;

    const email = normalized.email;
    const activeEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('scinexa_active_user_email') : null;
    if (activeEmail && activeEmail !== email) {
      clearActiveSessionKeys();
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('scinexa_active_user_email', email);
    }

    void (async () => {
      const dbProf = await dbFetchProfileByEmail(email);
      const scoped = getScopedUserProfile(email);

      const effectiveQuadName = dbProf?.quad_name || dbProf?.display_name || scoped?.quadName || '';
      const effectivePhone = dbProf?.parent_phone || scoped?.parentPhone || '';
      const effectiveGrade = dbProf?.grade_level || scoped?.gradeLevel || 'sec2';
      const effectiveSchool = dbProf?.school_name || dbProf?.school_code || scoped?.schoolName || '';
      const effectiveGov = dbProf?.governorate_id || scoped?.governorateId || 'cairo';
      const effectiveAdmin = dbProf?.administration_id || scoped?.administrationId || undefined;
      const currentXp = parseInt(getPersistedItem('scinexa_user_xp') || '0', 10) || undefined;
      const currentStars = parseInt(getPersistedItem('scinexa_user_stars') || '0', 10) || undefined;
      const currentStreak = parseInt(getPersistedItem('scinexa_real_streak') || '1', 10) || undefined;

      if (effectiveQuadName) {
        setPersistedItem('scinexa_user_fullname', effectiveQuadName);
      }
      if (effectivePhone) {
        setPersistedItem('scinexa_parent_phone', effectivePhone);
      }
      if (effectiveGrade) {
        setPersistedItem('scinexa_grade', effectiveGrade);
      }
      if (effectiveSchool) {
        setPersistedItem('scinexa_school', effectiveSchool);
      }

      saveScopedUserProfile(email, {
        quadName: effectiveQuadName,
        parentPhone: effectivePhone,
        gradeLevel: effectiveGrade,
        schoolName: effectiveSchool,
        governorateId: effectiveGov,
        administrationId: effectiveAdmin,
      });

      const syncRes = await dbUpsertProfile({
        id: normalized.id,
        email: normalized.email,
        display_name: effectiveQuadName || normalized.name,
        quad_name: effectiveQuadName || undefined,
        parent_phone: effectivePhone || undefined,
        school_code: effectiveSchool || undefined,
        school_name: effectiveSchool || undefined,
        governorate_id: effectiveGov,
        administration_id: effectiveAdmin,
        grade_level: effectiveGrade,
        xp: currentXp,
        stars: currentStars,
        streak: currentStreak,
        role: 'student',
      });
      if (!syncRes.ok && syncRes.error) {
        console.warn('Student profile sync warning:', syncRes.error);
      }

      window.dispatchEvent(new CustomEvent('scinexa_profile_updated', {
        detail: { quadName: effectiveQuadName, email }
      }));
    })();
  }, [isEducatorPortal, normalized?.id, normalized?.email]);

  const loginEducator = useCallback((auth: EducatorAuth) => {
    try {
      localStorage.setItem(EDUCATOR_AUTH_KEY, JSON.stringify(auth));
    } catch {
      /* ignore */
    }
    setEducator(auth);
  }, []);

  const logoutEducator = useCallback(() => {
    try {
      localStorage.removeItem(EDUCATOR_AUTH_KEY);
      localStorage.removeItem('scinexa_user_role');
      localStorage.removeItem('scinexa_dev_role');
    } catch {
      /* ignore */
    }
    setEducator(null);
  }, []);

  const [guestUser, setGuestUser] = useState<SessionUser | null>(() => {
    try {
      const raw = localStorage.getItem(DEMO_KEY);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  });

  const effectiveUser = isEducatorPortal ? null : (normalized || guestUser);

  const value = useMemo<SessionValue>(
    () => ({
      user: effectiveUser,
      isLoaded: isEducatorPortal ? true : isLoaded,
      isSignedIn: Boolean(effectiveUser),
      role: isEducatorPortal && educator ? educator.role : 'student', // منصة الطلاب مقصورة على الطالب وبوابة المعلم معزولة
      isDemo: Boolean(!isEducatorPortal && guestUser && !normalized),
      isRolePreview: false,
      educator,
      loginEducator,
      logoutEducator,
      signOut: async () => {
        try {
          clearActiveSessionKeys();
          localStorage.removeItem('scinexa_dev_role');
          localStorage.removeItem(DEMO_KEY);
        } catch {
          /* ignore */
        }
        setGuestUser(null);
        await signOut({ redirectUrl: '/' });
      },
      signInDemo: (input) => {
        const g: SessionUser = {
          id: 'guest_' + Date.now().toString(36),
          name: (input?.name || '').trim() || 'Guest',
          email: (input?.email || '').trim() || 'guest@scinexa.school',
          role: 'student',
          isDemo: true,
        };
        try {
          localStorage.setItem(DEMO_KEY, JSON.stringify(g));
        } catch {
          /* ignore */
        }
        setGuestUser(g);
      },
      switchDemoRole: () => {
        // Disabled completely: students cannot change role
      },
      clearRolePreview: () => {
        // Disabled
      },
    }),
    [effectiveUser, isEducatorPortal, normalized, guestUser, isLoaded, educator, loginEducator, logoutEducator, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

/* ── Local demo session (no Clerk key present) ────────────────────────────── */
const DemoSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isEducatorPortal =
    location.pathname.startsWith('/portal') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/teacher');

  const [user, setUser] = useState<SessionUser | null>(() => {
    try {
      const raw = localStorage.getItem(DEMO_KEY);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  });

  const [educator, setEducator] = useState<EducatorAuth | null>(readEducatorSession);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(DEMO_KEY, JSON.stringify(user));
      else localStorage.removeItem(DEMO_KEY);
    } catch {
      /* storage unavailable */
    }
  }, [user]);

  const signInDemo = useCallback((input: { name: string; email: string; role: AppRole }) => {
    setUser({
      id: `demo_${Date.now().toString(36)}`,
      name: (input?.name || '').trim() || 'SciNexa Student',
      email: (input?.email || '').trim() || 'demo@scinexa.school',
      role: 'student',
      isDemo: true,
    });
  }, []);

  const loginEducator = useCallback((auth: EducatorAuth) => {
    try {
      localStorage.setItem(EDUCATOR_AUTH_KEY, JSON.stringify(auth));
    } catch {
      /* ignore */
    }
    setEducator(auth);
  }, []);

  const logoutEducator = useCallback(() => {
    try {
      localStorage.removeItem(EDUCATOR_AUTH_KEY);
    } catch {
      /* ignore */
    }
    setEducator(null);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      user: isEducatorPortal ? null : user,
      isLoaded: true,
      isSignedIn: Boolean(!isEducatorPortal && user),
      role: isEducatorPortal && educator ? educator.role : 'student',
      isDemo: !isEducatorPortal,
      isRolePreview: false,
      educator,
      loginEducator,
      logoutEducator,
      signOut: async () => {
        setUser(null);
      },
      signInDemo,
      switchDemoRole: () => {},
      clearRolePreview: () => {},
    }),
    [user, isEducatorPortal, educator, loginEducator, logoutEducator, signInDemo]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  isClerkConfigured ? (
    <ClerkSessionProvider>{children}</ClerkSessionProvider>
  ) : (
    <DemoSessionProvider>{children}</DemoSessionProvider>
  );

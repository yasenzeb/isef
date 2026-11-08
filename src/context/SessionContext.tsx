import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { isClerkConfigured } from '../lib/clerkConfig';
import { dbUpsertProfile } from '../lib/supabase';

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
  const [educator, setEducator] = useState<EducatorAuth | null>(readEducatorSession);

  // في منصة الطلاب /app: المستخدم دائماً طالب (Student) ولا يملك صلاحية تغيير دوره
  const normalized: SessionUser | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress.split('@')[0] || 'Student',
      email: user.primaryEmailAddress?.emailAddress ?? '',
      role: 'student',
      avatarUrl: user.imageUrl,
      isDemo: false,
      grade: String((user.publicMetadata as Record<string, unknown> | undefined)?.grade ?? '') || undefined,
    };
  }, [user]);

  useEffect(() => {
    if (normalized?.email) {
      void dbUpsertProfile({
        id: normalized.id,
        email: normalized.email,
        display_name: normalized.name,
        role: 'student',
      });
    }
  }, [normalized?.id, normalized?.email, normalized?.name]);

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

  const value = useMemo<SessionValue>(
    () => ({
      user: normalized,
      isLoaded,
      isSignedIn: Boolean(normalized),
      role: 'student', // منصة الطلاب الرئيسية مقصورة على الطالب
      isDemo: false,
      isRolePreview: false,
      educator,
      loginEducator,
      logoutEducator,
      signOut: async () => {
        try {
          localStorage.removeItem('scinexa_dev_role');
          localStorage.removeItem(EDUCATOR_AUTH_KEY);
        } catch {
          /* ignore */
        }
        setEducator(null);
        await signOut({ redirectUrl: '/' });
      },
      signInDemo: () => {
        throw new Error('Demo sign-in is unavailable while Clerk is configured.');
      },
      switchDemoRole: () => {
        // Disabled completely: students cannot change role
      },
      clearRolePreview: () => {
        // Disabled
      },
    }),
    [normalized, isLoaded, educator, loginEducator, logoutEducator, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

/* ── Local demo session (no Clerk key present) ────────────────────────────── */
const DemoSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      user,
      isLoaded: true,
      isSignedIn: Boolean(user),
      role: 'student',
      isDemo: true,
      isRolePreview: false,
      educator,
      loginEducator,
      logoutEducator,
      signOut: async () => {
        setUser(null);
        logoutEducator();
      },
      signInDemo,
      switchDemoRole: () => {},
      clearRolePreview: () => {},
    }),
    [user, educator, loginEducator, logoutEducator, signInDemo]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  isClerkConfigured ? (
    <ClerkSessionProvider>{children}</ClerkSessionProvider>
  ) : (
    <DemoSessionProvider>{children}</DemoSessionProvider>
  );

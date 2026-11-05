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

import { getPersistedItem, setPersistedItem, removePersistedItem } from '../lib/cookies';
import { dbUpsertProfile } from '../lib/supabase';

export type AppRole = 'student' | 'teacher' | 'admin';

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
  signOut: () => Promise<void>;
  signInDemo: (input: { name: string; email: string; role: AppRole }) => void;
  switchDemoRole: (role: AppRole) => void;
  clearRolePreview: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

const DEMO_KEY = 'scinexa_demo_session';

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}

const normalizeRole = (value: unknown): AppRole => {
  const role = String(value ?? '').toLowerCase();
  if (role === 'teacher' || role === 'admin') return role;
  return 'student';
};

/* ── Clerk-backed session ─────────────────────────────────────────────────── */
const readDevRole = (): AppRole | null => {
  try {
    const value = getPersistedItem('scinexa_dev_role') || getPersistedItem('scinexa_user_role');
    return value === 'student' || value === 'teacher' || value === 'admin' ? value : null;
  } catch {
    return null;
  }
};

const ClerkSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const [previewRole, setPreviewRole] = useState<AppRole | null>(readDevRole);

  const normalized: SessionUser | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress.split('@')[0] || 'Student',
      email: user.primaryEmailAddress?.emailAddress ?? '',
      role: normalizeRole((user.publicMetadata as Record<string, unknown> | undefined)?.role),
      avatarUrl: user.imageUrl,
      isDemo: false,
      grade: String((user.publicMetadata as Record<string, unknown> | undefined)?.grade ?? '') || undefined,
    };
  }, [user]);

  const effectiveRole = previewRole ?? normalized?.role ?? 'student';

  const value = useMemo<SessionValue>(
    () => ({
      user: normalized,
      isLoaded,
      isSignedIn: Boolean(normalized),
      role: effectiveRole,
      isDemo: false,
      isRolePreview: Boolean(previewRole),
      signOut: async () => {
        try {
          localStorage.removeItem('scinexa_dev_role');
        } catch {
          /* ignore */
        }
        setPreviewRole(null);
        await signOut({ redirectUrl: '/' });
      },
      signInDemo: () => {
        throw new Error('Demo sign-in is unavailable while Clerk is configured.');
      },
      switchDemoRole: (role: AppRole) => {
        try {
          setPersistedItem('scinexa_dev_role', role);
          setPersistedItem('scinexa_user_role', role);
        } catch {
          /* ignore */
        }
        setPreviewRole(role);
      },
      clearRolePreview: () => {
        try {
          removePersistedItem('scinexa_dev_role');
          removePersistedItem('scinexa_user_role');
        } catch {
          /* ignore */
        }
        setPreviewRole(null);
      },
    }),
    [normalized, isLoaded, signOut, effectiveRole, previewRole]
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
      role: input?.role || 'student',
      isDemo: true,
    });
  }, []);

  const switchDemoRole = useCallback((role: AppRole) => {
    setUser((current) => (current ? { ...current, role } : current));
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      user,
      isLoaded: true,
      isSignedIn: Boolean(user),
      role: user?.role ?? 'student',
      isDemo: true,
      isRolePreview: false,
      signOut: async () => setUser(null),
      signInDemo,
      switchDemoRole,
      clearRolePreview: () => {},
    }),
    [user, signInDemo, switchDemoRole]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  isClerkConfigured ? (
    <ClerkSessionProvider>{children}</ClerkSessionProvider>
  ) : (
    <DemoSessionProvider>{children}</DemoSessionProvider>
  );

/**
 * AuthContext.tsx
 * Microsoft Entra ID (Azure AD) Authentication Context for SciNexa
 * Uses secure OAuth 2.0 + PKCE flow — no passwords stored anywhere.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// ─── User Profile (populated from Microsoft Graph + email domain) ───────────
export interface SciNexaUser {
  /** Microsoft Object ID (permanent, unique) */
  id: string;
  /** Full display name from Microsoft */
  displayName: string;
  /** Institutional email */
  email: string;
  /** Role derived from email subdomain */
  role: 'student' | 'teacher' | 'principal' | 'admin';
  /** School / Ministry metadata (from email domain) */
  schoolCode?: string;
  schoolName?: string;
  /** Student-specific */
  studentCode?: string;
  gradeLevel?: string;
  /** Teacher-specific */
  subject?: string;
  /** Microsoft Graph extended fields */
  department?: string;
  jobTitle?: string;
  officeLocation?: string;
  /** Profile photo URL (from Microsoft Graph) */
  photoUrl?: string;
  /** Raw Microsoft Graph profile */
  graphProfile?: Record<string, unknown>;
}

interface AuthState {
  user: SciNexaUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /** Fetch the current session from the secure server-side endpoint */
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setState({ user: data.user, isLoading: false, isAuthenticated: true });
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /** Redirect to Microsoft login (server generates PKCE + CSRF state) */
  const login = useCallback(() => {
    window.location.href = '/api/auth/login';
  }, []);

  /** Call server logout (clears HTTPOnly cookie) then redirect */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      window.location.href = '/login';
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

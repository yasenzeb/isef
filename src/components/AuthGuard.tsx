/**
 * AuthGuard.tsx
 * Wraps protected routes — redirects to /login if not authenticated.
 * Also shows a loading spinner while the session is being verified.
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from './LoginPage';

interface AuthGuardProps {
  children: React.ReactNode;
  /** If true, renders the login page inline instead of redirecting */
  inline?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, inline = true }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090a0d]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          <span className="text-slate-400 text-sm font-mono">جاري التحقق من الجلسة...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (inline) return <LoginPage />;
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
};

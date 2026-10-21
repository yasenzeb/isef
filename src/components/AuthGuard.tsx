/**
 * AuthGuard.tsx — Renders LoginPage if not authenticated, children if authenticated.
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from './LoginPage';
import { Loader2 } from 'lucide-react';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#090a0d', gap: 16,
      }}>
        <Loader2 size={36} style={{ color: '#4f8cff', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: '#8b90a0', fontSize: '0.85rem', fontFamily: 'monospace' }}>
          جاري التحقق من الجلسة...
        </span>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  return <>{children}</>;
};

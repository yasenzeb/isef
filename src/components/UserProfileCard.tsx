/**
 * UserProfileCard.tsx
 * Displays the current user's avatar, name, role badge and logout button
 * in the Navbar. Shown only when authenticated.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth, SciNexaUser } from '../context/AuthContext';
import { LogOut, ChevronDown, User, GraduationCap, BookOpen, Building2, Shield } from 'lucide-react';

const ROLE_CONFIG: Record<SciNexaUser['role'], { label: string; labelAr: string; color: string; icon: React.ReactNode }> = {
  student:   { label: 'Student',    labelAr: 'طالب',          color: '#4ade80', icon: <GraduationCap className="w-3 h-3" /> },
  teacher:   { label: 'Teacher',    labelAr: 'معلم',           color: '#60a5fa', icon: <BookOpen      className="w-3 h-3" /> },
  principal: { label: 'Principal',  labelAr: 'مدير مدرسة',    color: '#f59e0b', icon: <Building2     className="w-3 h-3" /> },
  admin:     { label: 'Admin',      labelAr: 'إداري',          color: '#e879f9', icon: <Shield        className="w-3 h-3" /> },
};

interface Props {
  language?: string;
}

export const UserProfileCard: React.FC<Props> = ({ language = 'ar' }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const cfg   = ROLE_CONFIG[user.role];
  const isAr  = language === 'ar';
  const initials = user.displayName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div ref={ref} style={{ position: 'relative', direction: isAr ? 'rtl' : 'ltr' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          background: 'rgba(255,255,255,.06)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 10,
          color: '#e8eaf0',
          cursor: 'pointer',
          transition: 'background .2s',
          fontSize: '0.88rem',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}
      >
        {/* Avatar */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: `linear-gradient(135deg, #4f8cff, #7c5cff)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.displayName}
        </span>

        {/* Role badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            padding: '2px 7px',
            borderRadius: 20,
            background: `${cfg.color}22`,
            border: `1px solid ${cfg.color}44`,
            color: cfg.color,
            fontSize: '0.72rem',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {cfg.icon}
          {isAr ? cfg.labelAr : cfg.label}
        </span>

        <ChevronDown
          className="w-3 h-3"
          style={{ color: '#8b90a0', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            [isAr ? 'right' : 'left']: 0,
            width: 280,
            background: '#12141a',
            border: '1px solid #262a35',
            borderRadius: 12,
            boxShadow: '0 16px 40px rgba(0,0,0,.6)',
            padding: '16px',
            zIndex: 999,
            color: '#e8eaf0',
          }}
        >
          {/* Profile header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #262a35' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f8cff, #7c5cff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName}
              </div>
              <div style={{ color: '#8b90a0', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, fontSize: '0.83rem' }}>
            <InfoRow label={isAr ? 'الدور' : 'Role'} value={isAr ? cfg.labelAr : cfg.label} valueColor={cfg.color} />
            {user.schoolCode && <InfoRow label={isAr ? 'كود المدرسة' : 'School Code'} value={user.schoolCode} />}
            {user.studentCode && <InfoRow label={isAr ? 'رقم الطالب' : 'Student ID'} value={user.studentCode} />}
            {user.department && <InfoRow label={isAr ? 'القسم' : 'Department'} value={user.department} />}
            {user.jobTitle && <InfoRow label={isAr ? 'المسمى الوظيفي' : 'Job Title'} value={user.jobTitle} />}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(248,113,113,.1)',
              border: '1px solid rgba(248,113,113,.25)',
              borderRadius: 8,
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 500,
              transition: 'background .2s',
              justifyContent: isAr ? 'flex-end' : 'flex-start',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,.1)')}
          >
            <LogOut className="w-4 h-4" />
            {isAr ? 'تسجيل الخروج' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
    <span style={{ color: '#8b90a0' }}>{label}</span>
    <span style={{ color: valueColor || '#e8eaf0', fontWeight: 500, textAlign: 'right' }}>{value}</span>
  </div>
);

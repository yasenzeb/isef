/**
 * UserProfileCard.tsx — Navbar profile card using Supabase auth
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { SciNexaProfile, UserRole } from '../context/AuthContext';
import { LogOut, ChevronDown, GraduationCap, BookOpen, Building2, Shield } from 'lucide-react';

const ROLE_CFG: Record<UserRole, { labelAr: string; labelEn: string; color: string; icon: React.ReactNode }> = {
  student:   { labelAr: 'طالب',       labelEn: 'Student',   color: '#4ade80', icon: <GraduationCap size={12}/> },
  teacher:   { labelAr: 'معلم',        labelEn: 'Teacher',   color: '#60a5fa', icon: <BookOpen      size={12}/> },
  principal: { labelAr: 'مدير مدرسة', labelEn: 'Principal', color: '#f59e0b', icon: <Building2     size={12}/> },
  admin:     { labelAr: 'إداري',       labelEn: 'Admin',     color: '#e879f9', icon: <Shield        size={12}/> },
};

export const UserProfileCard: React.FC<{ language?: string }> = ({ language = 'ar' }) => {
  const { user, logout } = useAuth();
  const [open, setOpen]  = useState(false);
  const ref              = useRef<HTMLDivElement>(null);
  const isAr             = language === 'ar';

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) return null;

  const cfg      = ROLE_CFG[user.role];
  const initials = user.displayName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px',
          background: 'rgba(255,255,255,.06)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 10, color: '#e8eaf0', cursor: 'pointer',
          fontSize: '0.86rem', transition: 'background .2s',
        }}
      >
        <Avatar initials={initials} url={user.avatarUrl} />
        <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.displayName}
        </span>
        <RoleBadge cfg={cfg} label={isAr ? cfg.labelAr : cfg.labelEn} />
        <ChevronDown size={13} style={{ color: '#8b90a0', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)',
          [isAr ? 'right' : 'left']: 0,
          width: 290,
          background: '#12141a',
          border: '1px solid #262a35',
          borderRadius: 14,
          boxShadow: '0 16px 40px rgba(0,0,0,.65)',
          padding: 18, zIndex: 1000, color: '#e8eaf0',
          direction: isAr ? 'rtl' : 'ltr',
        }}>

          {/* Profile header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid #262a35' }}>
            <Avatar initials={initials} url={user.avatarUrl} size={44} fontSize="1rem" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.96rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName}
              </div>
              <div style={{ color: '#8b90a0', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr' }}>
                {user.email}
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14, fontSize: '0.83rem' }}>
            <Row label={isAr ? 'الدور' : 'Role'} value={isAr ? cfg.labelAr : cfg.labelEn} color={cfg.color} />
            {user.schoolCode  && <Row label={isAr ? 'كود المدرسة' : 'School'} value={user.schoolCode} />}
            {user.studentCode && <Row label={isAr ? 'رقم الطالب'  : 'Student ID'} value={user.studentCode} />}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: isAr ? 'flex-end' : 'flex-start',
              gap: 8, width: '100%', padding: '10px 12px',
              background: 'rgba(248,113,113,.1)',
              border: '1px solid rgba(248,113,113,.25)',
              borderRadius: 9, color: '#fca5a5', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: 600,
              transition: 'background .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,.1)')}
          >
            <LogOut size={15} />
            {isAr ? 'تسجيل الخروج' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Mini components ───────────────────────────────────────────────────────────

const Avatar: React.FC<{ initials: string; url?: string; size?: number; fontSize?: string }> = ({
  initials, url, size = 30, fontSize = '0.72rem'
}) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: url ? 'transparent' : 'linear-gradient(135deg, #4f8cff, #7c5cff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize, fontWeight: 700, color: '#fff', overflow: 'hidden',
  }}>
    {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
  </div>
);

const RoleBadge: React.FC<{ cfg: { color: string; icon: React.ReactNode }; label: string }> = ({ cfg, label }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 3,
    padding: '2px 7px', borderRadius: 20,
    background: `${cfg.color}22`, border: `1px solid ${cfg.color}44`,
    color: cfg.color, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
  }}>
    {cfg.icon} {label}
  </span>
);

const Row: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
    <span style={{ color: '#8b90a0' }}>{label}</span>
    <span style={{ color: color || '#e8eaf0', fontWeight: 600 }}>{value}</span>
  </div>
);

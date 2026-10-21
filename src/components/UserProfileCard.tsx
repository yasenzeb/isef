/**
 * UserProfileCard.tsx — Navbar profile card using Supabase auth
 * Greets the student warmly (e.g. "أهلاً، ياسين 👋"), uses student/user icons instead of raw numbers,
 * and opens the Account Management Dashboard modal.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { SciNexaProfile, UserRole } from '../context/AuthContext';
import { AccountManagementModal } from './AccountManagementModal';
import {
  LogOut,
  ChevronDown,
  GraduationCap,
  BookOpen,
  Building2,
  Shield,
  Settings,
  Sparkles
} from 'lucide-react';

const ROLE_CFG: Record<UserRole, { labelAr: string; labelEn: string; color: string; icon: React.ReactNode }> = {
  student:   { labelAr: 'طالب',       labelEn: 'Student',   color: '#4ade80', icon: <GraduationCap size={12}/> },
  teacher:   { labelAr: 'معلم',        labelEn: 'Teacher',   color: '#60a5fa', icon: <BookOpen      size={12}/> },
  principal: { labelAr: 'مدير مدرسة', labelEn: 'Principal', color: '#f59e0b', icon: <Building2     size={12}/> },
  admin:     { labelAr: 'إداري',       labelEn: 'Admin',     color: '#e879f9', icon: <Shield        size={12}/> },
};

export const UserProfileCard: React.FC<{ language?: string }> = ({ language = 'ar' }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAr = language === 'ar';

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) return null;

  const cfg = ROLE_CFG[user.role] || ROLE_CFG.student;
  const firstName = user.displayName ? user.displayName.trim().split(' ')[0] : (isAr ? 'الطالب' : 'Student');

  // Friendly student avatar icon based on gender
  const avatarIcon = user.gender === 'female' ? '👧' : (user.role === 'teacher' ? '👨‍🏫' : '👦');

  return (
    <>
      <div ref={ref} className="relative select-none">
        {/* ── Trigger Pill ── */}
        <button
          onClick={() => setDropdownOpen(p => !p)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-indigo-400/40 transition-all cursor-pointer text-slate-200 shadow-sm"
        >
          {/* Avatar Icon */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm shadow-inner shrink-0">
            {avatarIcon}
          </div>

          {/* Warm Welcome Greeting */}
          <div className="flex flex-col items-start text-right">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <span>{isAr ? `أهلاً، ${firstName}` : `Hi, ${firstName}`}</span>
              <span className="text-amber-400">👋</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono -mt-0.5 font-semibold">
              {isAr ? 'وضع الطالب' : 'Student Mode'}
            </span>
          </div>

          <ChevronDown
            size={13}
            className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* ── Dropdown Menu ── */}
        {dropdownOpen && (
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            className={`absolute top-full mt-2 ${isAr ? 'left-0' : 'right-0'} w-72 rounded-2xl bg-[#12141a] border border-white/10 shadow-2xl p-4 z-[999] text-slate-200`}
            style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.85)' }}
          >
            {/* Profile header */}
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-white/10">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl shrink-0 shadow-md">
                {avatarIcon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white truncate">
                  {user.displayName}
                </div>
                <div dir="ltr" className="text-[11px] text-slate-400 truncate font-mono">
                  {user.email}
                </div>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-2 text-xs mb-3.5">
              <Row label={isAr ? 'الدور' : 'Role'} value={isAr ? cfg.labelAr : cfg.labelEn} color={cfg.color} />
              {user.studentCode && (
                <Row label={isAr ? 'كود الطالب' : 'Student Code'} value={user.studentCode} mono />
              )}
              {user.governorate && (
                <Row label={isAr ? 'المحافظة / المديرية' : 'Governorate'} value={user.governorate} />
              )}
              {user.age && (
                <Row label={isAr ? 'العمر' : 'Age'} value={`${user.age} ${isAr ? 'سنة' : 'yrs'}`} />
              )}
            </div>

            {/* Manage Account Button */}
            <button
              onClick={() => { setDropdownOpen(false); setModalOpen(true); }}
              className="w-full mb-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Settings size={14} />
              <span>{isAr ? 'إدارة بيانات الحساب والملف الشخصي' : 'Account Settings'}</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => { setDropdownOpen(false); logout(); }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-semibold text-xs transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>{isAr ? 'تسجيل الخروج' : 'Sign out'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Account Management Modal */}
      <AccountManagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        language={language}
      />
    </>
  );
};

const Row: React.FC<{ label: string; value: string; color?: string; mono?: boolean }> = ({ label, value, color, mono }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-slate-400">{label}</span>
    <span
      style={{ color: color || '#f1f5f9' }}
      className={`font-semibold ${mono ? 'font-mono text-[11px]' : ''}`}
    >
      {value}
    </span>
  </div>
);

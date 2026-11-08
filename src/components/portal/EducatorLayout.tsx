/**
 * EducatorLayout.tsx
 * واجهة العمل المعزولة والمحمية المخصصة للمعلمين والإدارة المدرسية
 * منفصلة تماماً عن منصة الطلاب ومحمية ببيانات الدخول المعتمدة
 *
 * © SciNexa Platform — ISEF 2026
 */

import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { LanguageSelector } from '../ui/LanguageSelector';
import { BrandMark } from '../ui/Brand';
import {
  GraduationCap,
  Users,
  ClipboardList,
  Building2,
  ShieldCheck,
  BarChart3,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Menu,
  X,
  School,
  Lock,
  ArrowRight
} from 'lucide-react';

export const EducatorLayout: React.FC = () => {
  const { language } = useLanguage();
  const { educator, logoutEducator } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const ar = language === 'ar';
  const [mobileOpen, setMobileOpen] = useState(false);

  // إذا لم يكن المعلم مسجلاً للدخول في بوابة المعلم، نوجهه لصفحة الدخول فوراً
  if (!educator) {
    return (
      <div dir={ar ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc]">
        <div className="max-w-[460px] w-full text-center p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-sm">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
            <Lock size={26} strokeWidth={2} />
          </div>
          <h2 className="text-[18px] font-bold text-[#0f172a] mb-2">
            {ar ? 'منطقة المعلمين والإدارة محمية' : 'Restricted Educator Zone'}
          </h2>
          <p className="text-[12px] text-[#64748b] leading-relaxed mb-6">
            {ar
              ? 'هذا القسم مخصص حصرياً للمشرفين والمعلمين المسجلين بالاسم الرباعي والرقم القومي. يمنع دخول الطلاب نهائياً.'
              : 'This section is strictly restricted to verified educators with national ID.'}
          </p>
          <Link
            to="/portal/login"
            className="sn-btn sn-btn-primary w-full py-2.5 text-[13px] font-bold flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} />
            <span>{ar ? 'تسجيل دخول المعلمين والمشرفين' : 'Go to Educator Login'}</span>
          </Link>
          <Link
            to="/app"
            className="mt-3 block text-[11px] text-[#64748b] hover:text-[#0f172a]"
          >
            {ar ? '← العودة لمنصة الطلاب العامة' : '← Back to Student Platform'}
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/portal', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/portal/classes', labelAr: 'فصولي المدرسية', labelEn: 'Classes', icon: GraduationCap },
    { to: '/portal/students', labelAr: 'سجلات الطلاب', labelEn: 'Students', icon: Users },
    { to: '/portal/assignments', labelAr: 'الواجبات والتكليفات', labelEn: 'Assignments', icon: ClipboardList },
    { to: '/portal/institutions', labelAr: 'المؤسسات والمدارس', labelEn: 'Institutions', icon: Building2 },
    { to: '/portal/users', labelAr: 'المستخدمون والأدوار', labelEn: 'Users & Roles', icon: ShieldCheck },
    { to: '/portal/analytics', labelAr: 'التحليلات الحية', labelEn: 'Live Analytics', icon: BarChart3 },
  ];

  const handleSignOut = () => {
    logoutEducator();
    navigate('/portal/login');
  };

  const roleText = educator.role === 'admin'
    ? (ar ? 'مسؤول النظام / مدير مدرسة' : 'System Administrator')
    : (ar ? 'معلم مشرف معتمد' : 'Supervisory Teacher');

  return (
    <div dir={ar ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* ── TOP HEADER BAR ── */}
      <header className="sticky top-0 z-30 h-16 border-b border-[#e2e8f0] bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sn-btn sn-btn-quiet sn-btn-icon lg:hidden text-[#64748b]"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/portal" className="flex items-center gap-2.5">
            <BrandMark size={30} />
            <div>
              <div className="text-[14px] font-bold text-[#0f172a] leading-none">SciNexa Educator</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#0284c7] font-semibold mt-0.5">
                {ar ? 'بوابة المعلمين والإدارة المدرسية' : 'Teacher & Admin Workspace'}
              </div>
            </div>
          </Link>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-3">
          {/* Educator identity pill */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0284c7]/10 text-[#0284c7]">
              <School size={15} strokeWidth={2} />
            </span>
            <div className="text-start leading-none">
              <div className="text-[12px] font-bold text-[#0f172a] max-w-[160px] truncate">{educator.name}</div>
              <div className="text-[10px] text-[#64748b] mt-0.5">{roleText}</div>
            </div>
          </div>

          <LanguageSelector compact />

          <Link
            to="/app"
            target="_blank"
            rel="noopener noreferrer"
            className="sn-btn sn-btn-outline sn-btn-sm !h-8 text-[11px] font-semibold hidden md:flex items-center gap-1.5 border-[#cbd5e1]"
            title={ar ? 'فتح منصة الطلاب في تبويب جديد' : 'Open student app'}
          >
            <span>{ar ? 'منصة الطلاب' : 'Student App'}</span>
            <ExternalLink size={12} />
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="sn-btn sn-btn-sm !h-8 text-[11px] font-bold text-red-600 hover:bg-red-50 border border-red-200"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">{ar ? 'خروج' : 'Logout'}</span>
          </button>
        </div>
      </header>

      {/* ── BODY WITH SIDEBAR & MAIN CONTENT ── */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 start-0 z-40 w-64 border-e border-[#e2e8f0] bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col p-4 pt-20 lg:pt-5">
            <div className="mb-4 px-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] font-bold">
                {ar ? 'إدارة التعليم والمدرسة' : 'Administration & Teaching'}
              </span>
            </div>

            <nav className="space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                      isActive
                        ? 'bg-[#0284c7] text-white shadow-xs'
                        : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{ar ? item.labelAr : item.labelEn}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* School affiliation footer */}
            <div className="pt-4 border-t border-[#f1f5f9] mt-auto">
              <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-[11px] text-[#64748b]">
                <div className="font-bold text-[#0f172a] truncate">{educator.schoolName || 'المدرسة المسجلة'}</div>
                <div className="text-[10px] font-mono text-[#0284c7] mt-0.5">
                  ID: {educator.nationalId ? '******' + educator.nationalId.slice(-4) : 'MOE'}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

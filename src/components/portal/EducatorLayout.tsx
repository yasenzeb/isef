/**
 * EducatorLayout.tsx
 * واجهة العمل الفاخرة والمعزولة المخصصة للمعلمين والإدارة المدرسية
 * مطابقة تماماً لنظام تصميم SciNexa الفاخر ونفس الخطوط والألوان
 *
 * © SciNexa Platform — ISEF 2026
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from '../../context/SessionContext';
import { LanguageSelector } from '../ui/LanguageSelector';
import { BrandMark } from '../ui/Brand';
import { analyzeSearchWithGemini, type GeminiSearchResult } from '../../lib/geminiAI';
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
  ArrowRight,
  Search,
  Sparkles,
  Command,
} from 'lucide-react';

export const EducatorLayout: React.FC = () => {
  const { language } = useLanguage();
  const { educator, logoutEducator } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const ar = language === 'ar';
  const ja = language === 'ja';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [geminiResult, setGeminiResult] = useState<GeminiSearchResult | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Global Ctrl+K / Cmd+K search listener
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Gemini AI search debouncer
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setGeminiResult(null);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await analyzeSearchWithGemini(query, language);
      setGeminiResult(res);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, language]);

  // حماية الصفحة: إذا لم يكن المعلم مسجلاً للدخول، نعرض شاشة التحقق الأمني
  if (!educator) {
    return (
      <div
        dir={ar ? 'rtl' : 'ltr'}
        className="min-h-screen flex items-center justify-center p-4 bg-[#f5f5f5]"
      >
        <div className="max-w-[440px] w-full text-center p-8 rounded-[24px] bg-white border border-[#e5e5e5] shadow-[0_12px_32px_-12px_rgba(10,10,10,0.18)]">
          <div className="mx-auto w-12 h-12 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center mb-4">
            <Lock size={22} strokeWidth={1.8} />
          </div>
          <h2 className="text-[17px] font-semibold text-[#0a0a0a] mb-2">
            {ar
              ? 'بوابة المعلمين والإدارة المدرسية محمية'
              : ja
              ? '教員・管理者専用ポータル（制限区域）'
              : 'Restricted Educator Zone'}
          </h2>
          <p className="text-[12px] text-[#737373] leading-relaxed mb-6">
            {ar
              ? 'هذه المساحة مخصصة حصرياً للمشرفين والمعلمين المعتمدين بالاسم الرباعي والرقم القومي. يمنع دخول الطلاب نهائياً.'
              : ja
              ? '本エリアは承認された教員・管理者の専用区域です。生徒のアクセスは制限されています。'
              : 'This section is strictly restricted to verified educators with national ID.'}
          </p>
          <Link
            to="/portal/login"
            className="sn-btn sn-btn-primary w-full py-2.5 text-[13px] font-bold flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} />
            <span>{ar ? 'تسجيل دخول المعلمين والمشرفين' : ja ? '教員ログイン' : 'Educator Login'}</span>
          </Link>
          <Link
            to="/app"
            className="mt-3 block text-[11px] text-[#737373] hover:text-[#0a0a0a]"
          >
            {ar ? '← العودة لمنصة الطلاب العامة' : ja ? '← 生徒向けアプリへ戻る' : '← Back to Student Platform'}
          </Link>
        </div>
      </div>
    );
  }

  const navGroups = [
    {
      titleAr: 'مساحة العمل',
      titleEn: 'Workspace',
      titleJa: 'ワークスペース',
      items: [
        {
          to: '/portal',
          labelAr: 'نظرة عامة',
          labelEn: 'Overview',
          labelJa: 'ダッシュボード',
          icon: LayoutDashboard,
          end: true,
        },
        {
          to: '/portal/classes',
          labelAr: 'فصولي المدرسية',
          labelEn: 'My Classes',
          labelJa: '担当クラス',
          icon: GraduationCap,
        },
        {
          to: '/portal/students',
          labelAr: 'سجلات الطلاب وأولياء الأمور',
          labelEn: 'Student Records',
          labelJa: '生徒名簿・連絡先',
          icon: Users,
        },
        {
          to: '/portal/assignments',
          labelAr: 'الواجبات والتكليفات',
          labelEn: 'Assignments',
          labelJa: '課題・提出物',
          icon: ClipboardList,
        },
      ],
    },
    {
      titleAr: 'الإدارة المدرسية',
      titleEn: 'Administration',
      titleJa: '学校管理',
      items: [
        {
          to: '/portal/institutions',
          labelAr: 'المؤسسات والمدارس',
          labelEn: 'Institutions',
          labelJa: '教育機関・学校',
          icon: Building2,
        },
        {
          to: '/portal/users',
          labelAr: 'المستخدمون والأدوار',
          labelEn: 'Users & Roles',
          labelJa: 'ユーザーと権限',
          icon: ShieldCheck,
        },
        {
          to: '/portal/analytics',
          labelAr: 'التحليلات الحية',
          labelEn: 'Live Analytics',
          labelJa: '学習分析データ',
          icon: BarChart3,
        },
      ],
    },
  ];

  const handleSignOut = () => {
    logoutEducator();
    navigate('/portal/login');
  };

  const roleText =
    educator.role === 'admin'
      ? ar
        ? 'مسؤول النظام / مدير مدرسة'
        : ja
        ? 'システム管理者'
        : 'System Administrator'
      : ar
      ? 'معلم مشرف معتمد'
      : ja
      ? '主任教諭'
      : 'Supervisory Teacher';

  const roleBadgeTone = educator.role === 'admin' ? 'sn-badge-amber' : 'sn-badge-green';

  const pageTitle = () => {
    if (location.pathname === '/portal') return ar ? 'نظرة عامة' : ja ? 'ダッシュボード' : 'Overview';
    if (location.pathname.startsWith('/portal/classes')) return ar ? 'فصولي المدرسية' : ja ? '担当クラス' : 'Classes';
    if (location.pathname.startsWith('/portal/students')) return ar ? 'سجلات الطلاب' : ja ? '生徒名簿' : 'Students';
    if (location.pathname.startsWith('/portal/assignments')) return ar ? 'الواجبات والتكليفات' : ja ? '課題' : 'Assignments';
    if (location.pathname.startsWith('/portal/institutions')) return ar ? 'المؤسسات والمدارس' : ja ? '教育機関' : 'Institutions';
    if (location.pathname.startsWith('/portal/users')) return ar ? 'المستخدمون والأدوار' : ja ? 'ユーザー権限' : 'Users & Roles';
    if (location.pathname.startsWith('/portal/analytics')) return ar ? 'التحليلات الحية' : ja ? '学習分析' : 'Analytics';
    return ar ? 'بوابة المعلمين' : 'Educator Portal';
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#e5e5e5] px-5">
        <Link to="/portal" className="flex items-center gap-2" aria-label="SciNexa educator">
          <BrandMark size={28} />
          <div className="leading-none">
            <div className="text-[15px] font-semibold tracking-[-0.03em]">SciNexa Educator</div>
            <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#a3a3a3]">
              OBSERVATORY · ISEF 2026
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="sn-btn sn-btn-quiet sn-btn-icon lg:!hidden"
          aria-label={ar ? 'إغلاق' : 'Close'}
        >
          <X size={17} strokeWidth={1.7} />
        </button>
      </div>

      {/* School Badge Pill */}
      <div className="border-b border-[#e5e5e5] p-3">
        <div className="flex items-center gap-2.5 rounded-[12px] border border-[#e5e5e5] bg-white px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#f5f5f5] text-[#0a0a0a]">
            <School size={16} strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-[#0a0a0a]">
              {educator.schoolName || (ar ? 'المدرسة غير محددة' : 'School Unspecified')}
            </div>
            <div className="text-[10px] text-[#737373]">{roleText}</div>
          </div>
          <span className={`sn-badge ${roleBadgeTone} !text-[9px]`}>
            {educator.role === 'admin' ? (ar ? 'إدارة' : 'Admin') : (ar ? 'معلم' : 'Teacher')}
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Educator Navigation">
        {navGroups.map((group) => (
          <div key={group.titleEn} className="mb-5">
            <div className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#a3a3a3]">
              {ar ? group.titleAr : ja ? group.titleJa : group.titleEn}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `sn-navitem ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={16} strokeWidth={1.7} className="shrink-0" />
                    <span className="truncate">
                      {ar ? item.labelAr : ja ? item.labelJa : item.labelEn}
                    </span>
                    <span className="sn-navdot" />
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section in Sidebar Footer */}
      <div className="border-t border-[#e5e5e5] p-3">
        <div className="flex items-center gap-2.5 rounded-[10px] px-2 py-2">
          <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#0a0a0a] font-medium text-white text-[12px]">
            {educator.name.charAt(0).toUpperCase() || 'T'}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-[#0a0a0a]">{educator.name}</div>
            <div className="truncate font-mono text-[10px] text-[#737373]">
              ID: {educator.nationalId ? '******' + educator.nationalId.slice(-4) : 'MOE.EGYPT'}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="sn-btn sn-btn-quiet sn-btn-icon text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label={ar ? 'تسجيل الخروج' : 'Sign out'}
            title={ar ? 'تسجيل الخروج' : 'Sign out'}
          >
            <LogOut size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div dir={ar ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f5f5f5]">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="fixed inset-y-0 start-0 z-30 hidden border-e border-[#e5e5e5] bg-white lg:block"
        style={{ width: 'var(--sidebar-width)' }}
      >
        {sidebar}
      </aside>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#0a0a0a]/30 backdrop-blur-[2px]"
            aria-label={ar ? 'إغلاق القائمة' : 'Close menu'}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative h-full border-e border-[#e5e5e5] bg-white shadow-xl"
            style={{ width: 'var(--sidebar-width)' }}
          >
            {sidebar}
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div className="flex min-h-screen flex-col lg:ps-[var(--sidebar-width)]">
        {/* ── TOPBAR ── */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e5e5e5] bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="sn-btn sn-btn-quiet sn-btn-icon lg:!hidden"
              aria-label={ar ? 'فتح القائمة' : 'Open menu'}
            >
              <Menu size={18} strokeWidth={1.8} />
            </button>
            <div className="text-[13px] font-medium text-[#0a0a0a]">
              <span className="text-[#a3a3a3]">
                {ar ? 'بوابة المعلم' : ja ? '教員ポータル' : 'Portal'} /{' '}
              </span>
              <span>{pageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="sn-input flex h-9 w-full max-w-xs items-center gap-2 rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-3.5 text-xs text-[#737373] hover:border-[#a3a3a3] transition-colors"
              aria-label="Search"
            >
              <Search size={14} strokeWidth={1.8} />
              <span className="flex-1 text-start truncate">
                {ar ? 'بحث ذكي بواسطة Gemini AI…' : ja ? 'Gemini AI 科学検索…' : 'AI Search labs & students…'}
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[#d4d4d4] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#737373]">
                <Command size={10} />K
              </kbd>
            </button>

            {/* Language Selector */}
            <LanguageSelector compact />

            {/* Link to public student app */}
            <Link
              to="/app"
              target="_blank"
              rel="noopener noreferrer"
              className="sn-btn sn-btn-outline sn-btn-sm !h-8 text-[11px] font-semibold hidden sm:flex items-center gap-1.5 border-[#e5e5e5] bg-white"
              title={ar ? 'فتح منصة الطلاب في تبويب مستقل' : 'Open Student App in new tab'}
            >
              <span>{ar ? 'منصة الطلاب' : ja ? '生徒用アプリ' : 'Student App'}</span>
              <ExternalLink size={12} />
            </Link>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="sn-btn sn-btn-outline sn-btn-sm !h-8 text-[11px] font-semibold text-red-600 hover:bg-red-50 border-red-200"
              title={ar ? 'تسجيل الخروج' : 'Sign out'}
            >
              <LogOut size={13} />
              <span className="hidden md:inline">{ar ? 'خروج' : 'Logout'}</span>
            </button>
          </div>
        </header>

        {/* ── MAIN BODY ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ── GLOBAL SEARCH MODAL WITH GEMINI AI ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
          <button
            type="button"
            className="absolute inset-0 bg-[#0a0a0a]/30 backdrop-blur-[3px]"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-[560px] overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-white shadow-[0_24px_80px_-24px_rgba(10,10,10,0.4)]">
            <div className="flex items-center gap-2 border-b border-[#e5e5e5] px-4">
              <Search size={16} strokeWidth={1.8} className="text-[#737373]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  ar
                    ? 'ابحث بالعامية أو الفصحى (مثال: تفاعل بيطلع دخان، عظمة الرجل، كواكب)…'
                    : ja
                    ? '日常語や専門用語で検索（例：発光する回路、大腿骨、化学反応）…'
                    : 'Search with informal words or concepts (e.g. circuits, femur, reactions)…'
                }
                className="h-12 flex-1 border-0 bg-transparent text-[13px] outline-none placeholder:text-[#a3a3a3]"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="sn-btn sn-btn-quiet sn-btn-icon"
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-3">
              {/* Gemini AI Card */}
              {geminiResult && (
                <div className="mb-3 rounded-[14px] border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-700">
                      <Sparkles size={13} className="text-cyan-500 animate-pulse" />
                      <span>
                        {ar
                          ? 'تحليل ذكي بواسطة Gemini AI'
                          : ja
                          ? 'Gemini AI による意図解析'
                          : 'Gemini AI Smart Intent Analysis'}
                      </span>
                    </div>
                    <span className="sn-badge sn-badge-blue !text-[9px]">
                      {geminiResult.matchedLab.badgeText}
                    </span>
                  </div>
                  <div className="text-[12px] font-semibold text-[#0a0a0a] mb-1">
                    {ja ? geminiResult.intentJa : ar ? geminiResult.intentAr : geminiResult.intentEn}
                  </div>
                  <p className="text-[11px] text-[#525252] leading-relaxed mb-2.5">
                    {ja
                      ? geminiResult.explanationJa
                      : ar
                      ? geminiResult.explanationAr
                      : geminiResult.explanationEn}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(geminiResult.matchedLab.path);
                      setSearchOpen(false);
                      setQuery('');
                    }}
                    className="sn-btn sn-btn-primary sn-btn-sm !h-7 !text-[11px] w-full flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {ar
                        ? `فتح ${geminiResult.matchedLab.titleAr} فوراً`
                        : ja
                        ? `${geminiResult.matchedLab.titleJa} を起動`
                        : `Launch ${geminiResult.matchedLab.titleEn}`}
                    </span>
                    <ArrowRight size={12} className={ar ? 'rotate-180' : ''} />
                  </button>
                </div>
              )}

              {/* Portal Quick Links */}
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#a3a3a3]">
                  {ar ? 'أقسام البوابة السريعة' : 'Portal Quick Sections'}
                </div>
                {[
                  { to: '/portal/classes', ar: 'فصولي المدرسية', en: 'My Classes', ja: '担当クラス' },
                  { to: '/portal/students', ar: 'سجلات الطلاب وأرقام أولياء الأمور', en: 'Student & Parent Records', ja: '生徒・保護者名簿' },
                  { to: '/portal/assignments', ar: 'الواجبات والتكليفات المعملية', en: 'Lab Assignments', ja: '実験課題' },
                  { to: '/portal/institutions', ar: 'المؤسسات والمدارس المتصلة', en: 'Institutions', ja: '学校一覧' },
                ].map((p) => (
                  <button
                    key={p.to}
                    type="button"
                    onClick={() => {
                      navigate(p.to);
                      setSearchOpen(false);
                      setQuery('');
                    }}
                    className="flex w-full items-center justify-between rounded-[10px] px-2.5 py-2 text-start hover:bg-[#fafafa] text-[12px] text-[#0a0a0a]"
                  >
                    <span>{ja ? p.ja : ar ? p.ar : p.en}</span>
                    <ArrowRight size={12} className={`text-[#a3a3a3] ${ar ? 'rotate-180' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducatorLayout;

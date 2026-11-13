import { SciNexaNavDock } from '../SciNexaNavDock';
import { LanguageSelector } from '../ui/LanguageSelector';
import { StudentProfileOnboardingModal } from '../auth/StudentProfileOnboardingModal';
import { analyzeSearchWithGemini, type GeminiSearchResult } from '../../lib/geminiAI';
import { getPersistedItem } from '../../lib/cookies';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSession, type AppRole } from '../../context/SessionContext';
import { LAB_MODULES } from '../../data/labs';
import { BrandMark } from '../ui/Brand';
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  Presentation,
  BarChart3,
  Settings,
  Users,
  GraduationCap,
  ClipboardList,
  Building2,
  ShieldCheck,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Command,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  UserCog,
  MessageSquareText,
} from 'lucide-react';

type NavItem = {
  to: string;
  en: string;
  ar: string;
  fr: string;
  de: string;
  ja: string;
  icon: React.ElementType;
  end?: boolean;
  roles?: AppRole[];
};

type NavGroup = { en: string; ar: string; fr: string; de: string; ja: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    en: 'Workspace',
    ar: 'مساحة العمل',
    fr: 'Espace de travail',
    de: 'Arbeitsbereich',
    ja: 'ワークスペース',
    items: [
      { to: '/app', en: 'Overview', ar: 'نظرة عامة', fr: 'Vue d’ensemble', de: 'Übersicht', ja: '概要', icon: LayoutDashboard, end: true },
      { to: '/app/curriculum', en: 'Curriculum', ar: 'المناهج', fr: 'Programmes', de: 'Lehrplan', ja: 'カリキュラム', icon: BookOpen },
      { to: '/app/labs', en: 'Laboratories', ar: 'المعامل', fr: 'Laboratoires', de: 'Labore', ja: '実験室', icon: FlaskConical },
      { to: '/app/classroom', en: 'Classroom', ar: 'السبورة', fr: 'Tableau interactif', de: 'Klassenraum', ja: 'スマート黒板', icon: Presentation },
      { to: '/app/progress', en: 'Progress', ar: 'التقدّم', fr: 'Progression', de: 'Fortschritt', ja: '学習進捗', icon: BarChart3, roles: ['student'] },
      { to: '/app/assistant', en: 'Assistant', ar: 'المساعد', fr: 'Assistant IA', de: 'Assistent', ja: 'AI科学助手', icon: MessageSquareText },
    ],
  },
  {
    en: 'Account',
    ar: 'الحساب',
    fr: 'Compte',
    de: 'Konto',
    ja: 'アカウント',
    items: [{ to: '/app/settings', en: 'Settings', ar: 'الإعدادات', fr: 'Paramètres', de: 'Einstellungen', ja: '設定', icon: Settings }],
  },
];

const ROLE_LABEL: Record<AppRole, { en: string; ar: string; fr: string; de: string; ja: string; tone: string }> = {
  student: { en: 'Student', ar: 'طالب', fr: 'Élève', de: 'Schüler', ja: '生徒', tone: 'sn-badge-blue' },
  teacher: { en: 'Teacher', ar: 'معلم', fr: 'Enseignant', de: 'Lehrer', ja: '教員', tone: 'sn-badge-green' },
  admin: { en: 'Administrator', ar: 'إدارة', fr: 'Administrateur', de: 'Administrator', ja: '管理者', tone: 'sn-badge-amber' },
};

const pageTitle = (path: string, lang: string): string => {
  const map: Record<string, { en: string; ar: string; fr: string; de: string; ja: string }> = {
    '/app': { en: 'Overview', ar: 'نظرة عامة', fr: 'Vue d’ensemble', de: 'Übersicht', ja: '概要' },
    '/app/curriculum': { en: 'Curriculum', ar: 'المناهج', fr: 'Programmes', de: 'Lehrplan', ja: 'カリキュラム' },
    '/app/labs': { en: 'Laboratories', ar: 'المعامل', fr: 'Laboratoires', de: 'Labore', ja: '実験室' },
    '/app/classroom': { en: 'Classroom', ar: 'السبورة', fr: 'Tableau interactif', de: 'Klassenraum', ja: 'スマート黒板' },
    '/app/progress': { en: 'Progress', ar: 'التقدّم', fr: 'Progression', de: 'Fortschritt', ja: '学習進捗' },
    '/app/assistant': { en: 'Assistant', ar: 'المساعد', fr: 'Assistant IA', de: 'Assistent', ja: 'AI科学助手' },
    '/app/classes': { en: 'My classes', ar: 'فصولي', fr: 'Mes classes', de: 'Meine Klassen', ja: '担当クラス' },
    '/app/students': { en: 'Students', ar: 'الطلاب', fr: 'Élèves', de: 'Schüler', ja: '生徒名簿' },
    '/app/assignments': { en: 'Assignments', ar: 'الواجبات', fr: 'Devoirs', de: 'Aufgaben', ja: '課題・提出物' },
    '/app/institutions': { en: 'Institutions', ar: 'المؤسسات', fr: 'Établissements', de: 'Institutionen', ja: '教育機関' },
    '/app/users': { en: 'Users & roles', ar: 'المستخدمون والأدوار', fr: 'Utilisateurs & rôles', de: 'Benutzer & Rollen', ja: 'ユーザーと権限' },
    '/app/analytics': { en: 'Analytics', ar: 'التحليلات', fr: 'Analytique', de: 'Analysen', ja: '学習分析' },
    '/app/settings': { en: 'Settings', ar: 'الإعدادات', fr: 'Paramètres', de: 'Einstellungen', ja: '設定' },
  };
  if (path.startsWith('/app/labs/')) {
    if (lang === 'ja') return '3Dバーチャル実験室';
    if (lang === 'fr') return 'Laboratoire 3D';
    if (lang === 'de') return '3D-Labor';
    if (lang === 'ar') return 'المعمل 3D';
    return '3D Laboratory';
  }
  const item = map[path] ?? { en: 'Overview', ar: 'نظرة عامة', fr: 'Vue d’ensemble', de: 'Übersicht', ja: '概要' };
  if (lang === 'ja') return item.ja;
  if (lang === 'fr') return item.fr;
  if (lang === 'de') return item.de;
  if (lang === 'ar') return item.ar;
  return item.en;
};

const Avatar: React.FC<{ name?: string; url?: string; size?: number }> = ({ name = '', url, size = 30 }) => {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-[#0a0a0a] font-medium text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {(name || '').trim().charAt(0).toUpperCase() || 'S'}
    </span>
  );
};

export const DashboardLayout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, role, isDemo, isRolePreview, signOut, switchDemoRole, clearRolePreview } = useSession();
  const ar = language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [geminiResult, setGeminiResult] = useState<GeminiSearchResult | null>(null);

  // Darwin Fish Audio watcher is managed globally in App.tsx (avoid duplicate listeners)

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

  const [studentQuadName, setStudentQuadName] = useState(() => getPersistedItem('scinexa_user_fullname') || '');
  const [savedGrade, setSavedGrade] = useState(() => getPersistedItem('scinexa_grade', 'sec2'));

  useEffect(() => {
    const handleProfileUpdate = () => {
      setStudentQuadName(getPersistedItem('scinexa_user_fullname') || '');
      setSavedGrade(getPersistedItem('scinexa_grade', 'sec2'));
    };
    window.addEventListener('scinexa_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('scinexa_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const isResearcher = savedGrade === 'university' || savedGrade === 'researcher';
  const effectiveName = studentQuadName || user?.name || (ar ? 'الباحث العلمي' : 'Researcher');

  const title = pageTitle(location.pathname, language);
  const roleMeta = isResearcher
    ? { en: 'Researcher', ar: 'باحث علمي حر', fr: 'Chercheur', de: 'Forscher', ja: '独立研究員', tone: 'sn-badge-green' }
    : ROLE_LABEL[role];

  useEffect(() => {
    setMobileOpen(false);
    setUserMenu(false);
    setNotifications(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setUserMenu(false);
        setNotifications(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const searchResults = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    const labs = LAB_MODULES.filter(
      (lab) =>
        !q ||
        lab.nameEn.toLowerCase().includes(q) ||
        lab.nameAr.includes(q) ||
        lab.categoryEn.toLowerCase().includes(q) ||
        lab.categoryAr.includes(q)
    ).slice(0, 5);

    const pages = [
      { to: '/app/curriculum', en: 'Curriculum & lessons', ar: 'المناهج والدروس' },
      { to: '/app/progress', en: 'Progress report', ar: 'تقرير التقدّم' },
      { to: '/app/classroom', en: 'Classroom mode', ar: 'وضع السبورة' },
      { to: '/app/settings', en: 'Account settings', ar: 'إعدادات الحساب' },
    ].filter((p) => !q || p.en.toLowerCase().includes(q) || p.ar.includes(q));

    return { labs, pages };
  }, [query]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-[#e5e5e5] px-5">
        <Link to="/app" className="flex items-center gap-2" aria-label="SciNexa dashboard">
          <BrandMark size={28} />
          <div className="leading-none">
            <div className="text-[15px] font-semibold tracking-[-0.03em]">SciNexa</div>
            <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#a3a3a3]">
              Observatory
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

      <div className="border-b border-[#e5e5e5] p-3">
        <div className="flex items-center gap-2.5 rounded-[12px] border border-[#e5e5e5] bg-white px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#f5f5f5] text-[#0a0a0a]">
            <GraduationCap size={16} strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium">SciNexa Academy</div>
            <div className="text-[10px] text-[#737373]">ISEF 2026 · Egypt</div>
          </div>
          <span className={`sn-badge ${roleMeta.tone} !text-[9px]`}>
            {language === 'ja' ? roleMeta.ja : language === 'fr' ? roleMeta.fr : language === 'de' ? roleMeta.de : ar ? roleMeta.ar : roleMeta.en}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={ar ? 'تنقل لوحة التحكم' : 'Dashboard navigation'}>
        {NAV.map((group) => {
          const items = group.items.filter((item) => {
            if (isResearcher && item.to === '/app/curriculum') return false;
            return !item.roles || item.roles.includes(role);
          });
          if (items.length === 0) return null;
          return (
            <div key={group.en} className="mb-5">
              <div className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#a3a3a3]">
                {language === 'ja' ? group.ja : language === 'fr' ? group.fr : language === 'de' ? group.de : ar ? group.ar : group.en}
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => `sn-navitem ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={16} strokeWidth={1.7} className="shrink-0" />
                      <span className="truncate">{language === 'ja' ? item.ja : language === 'fr' ? item.fr : language === 'de' ? item.de : ar ? item.ar : item.en}</span>
                      <span className="sn-navdot" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[#e5e5e5] p-3">
        <div className="flex items-center gap-2.5 rounded-[10px] px-2 py-2">
          <Avatar name={effectiveName} url={user?.avatarUrl} size={30} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-[#0a0a0a]">{effectiveName}</div>
            <div className="truncate text-[10px] text-[#737373]">{user?.email}</div>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="sn-btn sn-btn-quiet sn-btn-icon"
            aria-label={ar ? 'تسجيل الخروج' : 'Sign out'}
            title={ar ? 'تسجيل الخروج' : 'Sign out'}
          >
            <LogOut size={15} strokeWidth={1.7} />
          </button>
        </div>
        {isDemo && (
          <div className="mt-1 px-2 font-mono text-[9px] uppercase tracking-[0.08em] text-[#a3a3a3]">
            {ar ? 'جلسة تجريبية' : 'demo session'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]" dir={ar ? 'rtl' : 'ltr'}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-[264px] sn-sidebar lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#0a0a0a]/30 backdrop-blur-[2px]"
            aria-label={ar ? 'إغلاق القائمة' : 'Close menu'}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 w-[286px] bg-[#fafafa] shadow-2xl">{sidebar}</div>
        </div>
      )}

      <div className="lg:ps-[264px]">
        <header className="sn-topbar sticky top-0 z-20 flex h-16 items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="sn-btn sn-btn-quiet sn-btn-icon lg:!hidden"
            aria-label={ar ? 'القائمة' : 'Menu'}
          >
            <Menu size={18} strokeWidth={1.7} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] text-[#a3a3a3]">
              <span>SciNexa</span>
              <span>/</span>
              <span className="text-[#737373]">{title}</span>
            </div>
            <h1 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">{title}</h1>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 w-[240px] items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-[#fafafa] px-3 text-[12px] text-[#737373] transition-colors hover:bg-white md:flex"
          >
            <Search size={14} strokeWidth={1.8} />
            <span className="flex-1 text-start">{ar ? 'ابحث في المنصة' : 'Search SciNexa'}</span>
            <span className="rounded border border-[#e5e5e5] bg-white px-1.5 py-0.5 font-mono text-[9px] text-[#a3a3a3]">
              ⌘K
            </span>
          </button>

          <LanguageSelector compact />

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifications((v) => !v);
                setUserMenu(false);
              }}
              className="sn-btn sn-btn-quiet sn-btn-icon relative"
              aria-label={ar ? 'الإشعارات' : 'Notifications'}
              aria-expanded={notifications}
            >
              <Bell size={17} strokeWidth={1.7} />
              <span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-[#1d4ed8] ring-2 ring-white" />
            </button>
            {notifications && (
              <div className="absolute end-0 top-11 z-40 w-[300px] rounded-[16px] border border-[#e5e5e5] bg-white p-2 shadow-[0_18px_50px_-20px_rgba(10,10,10,0.3)]">
                <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#a3a3a3]">
                  {ar ? 'الإشعارات' : 'Notifications'}
                </div>
                {[
                  { en: 'Weekly chemistry assessment is ready', ar: 'تقييم الكيمياء الأسبوعي جاهز', time: ar ? 'الآن' : 'now' },
                  { en: 'New anatomy module: nervous system', ar: 'وحدة تشريح جديدة: الجهاز العصبي', time: ar ? '٢ س' : '2h' },
                  { en: 'Your class report was generated', ar: 'تم إنشاء تقرير فصلك', time: ar ? 'أمس' : '1d' },
                ].map((n) => (
                  <div key={n.en} className="flex gap-2.5 rounded-[10px] px-2 py-2 hover:bg-[#fafafa]">
                    <CheckCircle2 size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#047857]" />
                    <div className="min-w-0">
                      <div className="text-[12px] leading-snug text-[#171717]">{ar ? n.ar : n.en}</div>
                      <div className="mt-0.5 text-[10px] text-[#a3a3a3]">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setUserMenu((v) => !v);
                setNotifications(false);
              }}
              className="flex h-9 items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-white ps-1 pe-2 transition-colors hover:bg-[#fafafa]"
              aria-label={ar ? 'حساب المستخدم' : 'User menu'}
              aria-expanded={userMenu}
            >
              <Avatar name={effectiveName} url={user?.avatarUrl} size={26} />
              <span className="hidden max-w-[140px] truncate text-[12px] font-medium md:block">
                {effectiveName.split(' ')[0]}
              </span>
              <ChevronDown size={13} strokeWidth={1.8} className="text-[#737373]" />
            </button>

            {userMenu && (
              <div className="absolute end-0 top-11 z-40 w-[268px] rounded-[16px] border border-[#e5e5e5] bg-white p-2 shadow-[0_18px_50px_-20px_rgba(10,10,10,0.3)]">
                <div className="flex items-center gap-2.5 px-2 py-2">
                  <Avatar name={effectiveName} url={user?.avatarUrl} size={34} />
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-medium">{effectiveName}</div>
                    <div className="truncate text-[10px] text-[#737373]">{user?.email}</div>
                  </div>
                </div>
                <div className="my-1 h-px bg-[#f0f0f0]" />
                <Link to="/app/settings" className="sn-navitem !h-8 !text-[12px]">
                  <Settings size={14} strokeWidth={1.7} />
                  {ar ? 'الإعدادات' : 'Settings'}
                </Link>
                <Link to="/" className="sn-navitem !h-8 !text-[12px]">
                  <ArrowRight size={14} strokeWidth={1.7} className={ar ? 'rotate-180' : ''} />
                  {ar ? 'الموقع العام' : 'Public site'}
                </Link>

                <div className="my-1 h-px bg-[#f0f0f0]" />
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="sn-navitem !h-8 !text-[12px] text-[#e7000b] hover:!text-[#e7000b]"
                >
                  <LogOut size={14} strokeWidth={1.7} />
                  {ar ? 'تسجيل الخروج' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6 md:py-8 pb-28">
          <Outlet />
        </main>
      </div>

      {/* Application Bottom Taskbar Dock */}
      <SciNexaNavDock />

      {/* Mandatory Onboarding Modal for School Enrollment */}
      <StudentProfileOnboardingModal />

      {/* Search dialog */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
          <button
            type="button"
            className="absolute inset-0 bg-[#0a0a0a]/25 backdrop-blur-[3px]"
            aria-label={ar ? 'إغلاق البحث' : 'Close search'}
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-[560px] overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-white shadow-[0_24px_80px_-24px_rgba(10,10,10,0.4)]">
            <div className="flex items-center gap-2 border-b border-[#e5e5e5] px-4">
              <Search size={16} strokeWidth={1.8} className="text-[#737373]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ar ? 'ابحث عن معمل، درس، أو صفحة…' : 'Search labs, lessons, or pages…'}
                className="h-12 flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#a3a3a3]"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="sn-btn sn-btn-quiet sn-btn-icon"
                aria-label={ar ? 'إغلاق' : 'Close'}
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {/* Gemini AI Smart Intent Analysis */}
              {geminiResult && (
                <div className="mb-3 rounded-[14px] border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-700">
                      <Sparkles size={13} className="text-cyan-500" />
                      <span>{ar ? 'تحليل ذكي بواسطة Gemini AI' : language === 'ja' ? 'Gemini AI による意図解析' : 'Gemini AI Intent Analysis'}</span>
                    </div>
                    <span className="sn-badge sn-badge-blue !text-[9px]">
                      {geminiResult.matchedLab.badgeText}
                    </span>
                  </div>
                  <div className="text-[12px] font-semibold text-[#0a0a0a] mb-1">
                    {language === 'ja' ? geminiResult.intentJa : ar ? geminiResult.intentAr : geminiResult.intentEn}
                  </div>
                  <p className="text-[11px] text-[#525252] leading-relaxed mb-2.5">
                    {language === 'ja' ? geminiResult.explanationJa : ar ? geminiResult.explanationAr : geminiResult.explanationEn}
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
                        : language === 'ja'
                        ? `${geminiResult.matchedLab.titleJa} を起動`
                        : `Launch ${geminiResult.matchedLab.titleEn}`}
                    </span>
                    <ArrowRight size={12} className={ar ? 'rotate-180' : ''} />
                  </button>
                </div>
              )}

              {searchResults.labs.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1.5 text-[10px] uppercase tracking-[0.1em] text-[#a3a3a3]">
                    {ar ? 'المعامل' : 'Laboratories'}
                  </div>
                  {searchResults.labs.map((lab) => {
                    const Icon = FlaskConical;
                    return (
                      <button
                        key={lab.id}
                        type="button"
                        onClick={() => {
                          navigate(`/app/labs/${lab.id}`);
                          setSearchOpen(false);
                          setQuery('');
                        }}
                        className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-start hover:bg-[#fafafa]"
                      >
                        <span className={`sn-${lab.accent} sn-icon-tile !h-8 !w-8 !rounded-[8px]`}>
                          <Icon size={14} strokeWidth={1.7} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium">{ar ? lab.nameAr : lab.nameEn}</span>
                          <span className="block truncate text-[10px] text-[#737373]">{ar ? lab.categoryAr : lab.categoryEn}</span>
                        </span>
                        <ArrowRight size={13} strokeWidth={1.8} className={`text-[#a3a3a3] ${ar ? 'rotate-180' : ''}`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {searchResults.pages.length > 0 && (
                <div>
                  <div className="px-2 py-1.5 text-[10px] uppercase tracking-[0.1em] text-[#a3a3a3]">
                    {ar ? 'الصفحات' : 'Pages'}
                  </div>
                  {searchResults.pages.map((page) => (
                    <button
                      key={page.to}
                      type="button"
                      onClick={() => {
                        navigate(page.to);
                        setSearchOpen(false);
                        setQuery('');
                      }}
                      className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-start hover:bg-[#fafafa]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#e5e5e5]">
                        <Command size={13} strokeWidth={1.7} className="text-[#737373]" />
                      </span>
                      <span className="flex-1 text-[13px]">{ar ? page.ar : page.en}</span>
                      <ArrowRight size={13} strokeWidth={1.8} className={`text-[#a3a3a3] ${ar ? 'rotate-180' : ''}`} />
                    </button>
                  ))}
                </div>
              )}

              {searchResults.labs.length === 0 && searchResults.pages.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Sparkles size={18} strokeWidth={1.6} className="text-[#a3a3a3]" />
                  <div className="text-[13px] text-[#737373]">{ar ? 'لا توجد نتائج مطابقة' : 'No matching results'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;

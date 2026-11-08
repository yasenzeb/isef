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
import { tLang } from '../../i18n/langHelpers';
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
  Mic,
  Radio,
  Volume2,
  Bot,
  Send,
  FlaskConical,
  Atom,
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

  // Educator Fish Audio Voice Assistant State
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceCommandText, setVoiceCommandText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceReply, setVoiceReply] = useState<string | null>(null);
  const [voiceLink, setVoiceLink] = useState<{ to: string; label: string } | null>(null);

  const speakEducator = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (language === 'ar') utterance.lang = 'ar-EG';
      else if (language === 'ja') utterance.lang = 'ja-JP';
      else if (language === 'fr') utterance.lang = 'fr-FR';
      else if (language === 'de') utterance.lang = 'de-DE';
      else utterance.lang = 'en-US';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {
      /* ignore */
    }
  };

  const executeEducatorVoiceCommand = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;
    const lower = text.toLowerCase();

    if (lower.includes('فصل') || lower.includes('classes') || lower.includes('فصول')) {
      if (location.pathname === '/portal/classes') {
        const rep = ar ? 'أنت بالفعل داخل صفحة إدارة الفصول المدرسية حالياً.' : 'You are already inside the Classes management section.';
        setVoiceReply(rep);
        speakEducator(rep);
        return;
      }
      const rep = ar
        ? 'حاضر يا أستاذنا، أنقلك الآن إلى إدارة الفصول المدرسية لإضافة فصول جديدة أو تعديلها.'
        : 'Navigating to Classes management to create or configure school classes.';
      setVoiceReply(rep);
      setVoiceLink({ to: '/portal/classes', label: ar ? 'فتح فصولي المدرسية' : 'Open Classes' });
      speakEducator(rep);
      setTimeout(() => {
        navigate('/portal/classes');
        setIsVoiceOpen(false);
      }, 1400);
      return;
    }

    if (lower.includes('طالب') || lower.includes('طلاب') || lower.includes('students') || lower.includes('أولياء')) {
      if (location.pathname === '/portal/students') {
        const rep = ar ? 'أنت بالفعل داخل صفحة سجلات الطلاب وأولياء الأمور حالياً.' : 'You are already on the Student Records page.';
        setVoiceReply(rep);
        speakEducator(rep);
        return;
      }
      const rep = ar
        ? 'بالتأكيد، أنقلك إلى سجلات الطلاب وأولياء الأمور للربط بالاسم الرباعي والمتابعة عبر واتساب.'
        : 'Opening Student & Parent Records for Quad Name linking and WhatsApp contact.';
      setVoiceReply(rep);
      setVoiceLink({ to: '/portal/students', label: ar ? 'فتح سجلات الطلاب' : 'Open Student Records' });
      speakEducator(rep);
      setTimeout(() => {
        navigate('/portal/students');
        setIsVoiceOpen(false);
      }, 1400);
      return;
    }

    if (lower.includes('واجب') || lower.includes('واجبات') || lower.includes('assignments') || lower.includes('تاسك')) {
      if (location.pathname === '/portal/assignments') {
        const rep = ar ? 'أنت بالفعل في قسم الواجبات والتكليفات المعملية حالياً.' : 'You are already in the Assignments section.';
        setVoiceReply(rep);
        speakEducator(rep);
        return;
      }
      const rep = ar
        ? 'حاضر، أنقلك لقسم الواجبات والتكليفات المعملية لإنشاء واجب جديد وتحديد موعد التسليم.'
        : 'Navigating to Assignments to assign new laboratory tasks and homework.';
      setVoiceReply(rep);
      setVoiceLink({ to: '/portal/assignments', label: ar ? 'فتح الواجبات' : 'Open Assignments' });
      speakEducator(rep);
      setTimeout(() => {
        navigate('/portal/assignments');
        setIsVoiceOpen(false);
      }, 1400);
      return;
    }

    if (lower.includes('مؤسس') || lower.includes('مدارس') || lower.includes('institutions') || lower.includes('مدرسة')) {
      if (location.pathname === '/portal/institutions') {
        const rep = ar ? 'أنت بالفعل داخل دليل المؤسسات والمدارس حالياً.' : 'You are already inside Institutions directory.';
        setVoiceReply(rep);
        speakEducator(rep);
        return;
      }
      const rep = ar
        ? 'جارٍ توجيهك إلى إدارة المؤسسات والمدارس وقواعد البيانات.'
        : 'Opening Institutions & Schools directory.';
      setVoiceReply(rep);
      setVoiceLink({ to: '/portal/institutions', label: ar ? 'فتح المؤسسات' : 'Open Institutions' });
      speakEducator(rep);
      setTimeout(() => {
        navigate('/portal/institutions');
        setIsVoiceOpen(false);
      }, 1400);
      return;
    }

    if (lower.includes('تحليل') || lower.includes('analytics') || lower.includes('إحصائيات')) {
      if (location.pathname === '/portal/analytics') {
        const rep = ar ? 'أنت بالفعل تشاهد صفحة التحليلات الحية ونسب الإنجاز حالياً.' : 'You are already viewing Live Analytics.';
        setVoiceReply(rep);
        speakEducator(rep);
        return;
      }
      const rep = ar
        ? 'أنقلك الآن للتحليلات الحية ومتابعة نسب إنجاز الطلاب ومتوسط الدرجات.'
        : 'Opening Live Analytics to inspect student performance and mastery levels.';
      setVoiceReply(rep);
      setVoiceLink({ to: '/portal/analytics', label: ar ? 'عرض التحليلات' : 'Open Analytics' });
      speakEducator(rep);
      setTimeout(() => {
        navigate('/portal/analytics');
        setIsVoiceOpen(false);
      }, 1400);
      return;
    }

    if (lower.includes('كيمياء') || lower.includes('معمل الكيمياء')) {
      const rep = ar
        ? 'حاضر يا أستاذ، أفتح لك معمل الكيمياء الافتراضي ثلاثي الأبعاد في تبويب مستقل للشرح العملي.'
        : 'Launching 3D Chemistry virtual lab for interactive teaching.';
      setVoiceReply(rep);
      setVoiceLink({ to: '/app/labs/chemistry', label: ar ? 'فتح معمل الكيمياء 3D' : 'Open Chemistry Lab' });
      speakEducator(rep);
      setTimeout(() => {
        window.open('/app/labs/chemistry', '_blank');
        setIsVoiceOpen(false);
      }, 1400);
      return;
    }

    // Default intelligent guidance
    const defaultRep = ar
      ? `أهلاً بك يا أستاذ ${educator?.name || ''}! يمكنك ربط الطلاب عبر الاسم الرباعي الرسمي، أو إنشاء فصل جديد من قسم "فصولي المدرسية"، أو إضافة واجب معملي في دقائق. كيف يمكنني مساعدتك الآن؟`
      : `Welcome Educator ${educator?.name || ''}! You can link students via official Quad Names, create classes, or dispatch 3D lab assignments. How may I assist you today?`;
    setVoiceReply(defaultRep);
    speakEducator(defaultRep);
  };

  const toggleEducatorMic = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(ar ? 'المتصفح لا يدعم الميكروفون المباشر.' : 'Speech recognition not supported.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = ar ? 'ar-EG' : language === 'ja' ? 'ja-JP' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => setIsListening(true);
      rec.onresult = (e: any) => {
        const transcript = e.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setVoiceCommandText(transcript);
          executeEducatorVoiceCommand(transcript);
        }
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

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

            {/* Darwin AI Educator Voice Assistant Trigger */}
            <button
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              className="sn-btn sn-btn-sm !h-8 px-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-all"
              title={ar ? 'مساعد داروين الصوتي للمعلمين والإدارة' : 'Darwin AI Voice Assistant'}
            >
              <Mic size={13} className="animate-pulse" />
              <span className="hidden sm:inline">
                {tLang(language, {
                  ar: 'المساعد الصوتي',
                  en: 'Voice Guide',
                  fr: 'Guide vocal',
                  de: 'Sprachassistent',
                  ja: '音声AIガイド',
                })}
              </span>
            </button>

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

      {/* ── EDUCATOR FISH AUDIO VOICE CONTROLLER MODAL ── */}
      {isVoiceOpen && (
        <div
          role="dialog"
          aria-modal="true"
          dir={ar ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-[560px] rounded-[24px] bg-[#0c0e14] text-white shadow-2xl border border-white/15 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-gradient-to-r from-cyan-950/60 to-transparent">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Mic size={18} strokeWidth={2.2} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-cyan-400 font-bold">
                    <Radio size={11} className="animate-pulse" />
                    <span>Fish Audio Voice Engine · داروين الموجه الصوتي للمعلمين</span>
                  </div>
                  <h3 className="text-[14px] font-bold text-white">
                    {tLang(language, {
                      ar: 'المساعد الصوتي لإدارة الفصول والمعامل',
                      en: 'Educator Voice Assistant & Class Controller',
                      fr: 'Assistant vocal pour enseignants',
                      de: 'Sprachassistent für Lehrkräfte',
                      ja: '教員・管理者向け音声アシスタント',
                    })}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Educator Context Ribbon */}
            <div className="px-5 py-2.5 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-cyan-300">
                <span className="font-mono text-[10px] text-white/60">
                  {ar ? 'المعلم المشرف:' : 'Educator:'}
                </span>
                <strong className="text-white font-medium">{educator?.name}</strong>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {educator?.role === 'admin' ? (ar ? 'مدير نظام معتمد' : 'Admin') : (ar ? 'معلم مشرف معتمد' : 'Teacher')}
              </span>
            </div>

            {/* Animated Equalizer Waveform */}
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-2">
                <Volume2 size={14} />
                <span>
                  {isListening
                    ? (ar ? 'جارٍ الاستماع لصوتك الآن...' : 'Listening...')
                    : (ar ? 'تحدث بأمرك أو اختر من الإجراءات السريعة:' : 'Speak command or select action:')}
                </span>
              </div>
              <div className="flex items-center gap-1 h-5">
                {[30, 70, 50, 90, 60, 80, 40, 95, 65, 55].map((h, i) => (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-200 ${
                      isListening ? 'bg-cyan-400 animate-pulse' : 'bg-white/30'
                    }`}
                    style={{ height: isListening ? `${h}%` : `${h * 0.35}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Quick Action Voice Chips for Educators */}
            <div className="px-5 py-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '🏫 إدارة الفصول الدراسية', cmd: 'انقلني للفصول' },
                  { label: '👥 سجلات الطلاب وأولياء الأمور', cmd: 'افتح سجلات الطلاب' },
                  { label: '📋 إنشاء واجب وتكليف معملي', cmd: 'افتح قسم الواجبات' },
                  { label: '🧪 فتح معمل الكيمياء 3D للشرح', cmd: 'افتح معمل الكيمياء' },
                  { label: '📊 عرض التحليلات الحية والنتائج', cmd: 'افتح التحليلات' },
                  { label: '🏫 بيانات المدارس والمؤسسات', cmd: 'المؤسسات المدرسية' },
                ].map((chip) => (
                  <button
                    key={chip.cmd}
                    type="button"
                    onClick={() => executeEducatorVoiceCommand(chip.cmd)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 hover:text-white text-[11px] font-medium transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Response Display Box */}
            {voiceReply && (
              <div className="mx-5 my-3 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-100 text-[12px] leading-relaxed">
                <div className="font-bold text-cyan-300 text-[11px] mb-1 flex items-center gap-1.5">
                  <Bot size={13} />
                  <span>{ar ? 'توجيه داروين للمعلم:' : 'Darwin Educator Guidance:'}</span>
                </div>
                <div>{voiceReply}</div>
                {voiceLink && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate(voiceLink.to);
                      setIsVoiceOpen(false);
                    }}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-[11px] font-bold transition-colors"
                  >
                    <span>{voiceLink.label}</span>
                    <ArrowRight size={11} className={ar ? 'rotate-180' : ''} />
                  </button>
                )}
              </div>
            )}

            {/* Voice & Text Input Bar */}
            <div className="p-4 bg-black/40 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (voiceCommandText.trim()) executeEducatorVoiceCommand(voiceCommandText);
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleEducatorMic}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                  }`}
                  title={ar ? 'تحدث بالميكروفون' : 'Voice Input'}
                >
                  <Mic size={17} />
                </button>
                <input
                  type="text"
                  value={voiceCommandText}
                  onChange={(e) => setVoiceCommandText(e.target.value)}
                  placeholder={
                    isListening
                      ? (ar ? 'جارٍ الاستماع لصوتك الآن...' : 'Listening...')
                      : (ar ? 'قل أمرك أو اكتب (مثال: أضف فصل جديد، افتح معمل الكيمياء)...' : 'Speak or type command for Darwin...')
                  }
                  className="flex-1 h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-[12px] text-white placeholder:text-white/40 outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[12px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Send size={13} />
                  <span>{tLang(language, { ar: 'تنفيذ', en: 'Run', fr: 'Exécuter', de: 'Starten', ja: '実行' })}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducatorLayout;

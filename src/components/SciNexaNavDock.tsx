/**
 * SciNexaNavDock.tsx — شريط التنقل الكبسولي المتطور لمنصة ساينكسا
 * كبسولة زجاجية داكنة فخمة تضم المعامل الستة والأوفر فيو وزر داروين الصوتي المباشر
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSession } from '../context/SessionContext';
import {
  Home,
  Activity,
  Zap,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles,
  Mic,
  X,
  Radio,
  Volume2,
  Eye,
  ShieldAlert,
  Send,
  Navigation,
  Lock,
} from 'lucide-react';

interface SciNexaNavDockProps {
  className?: string;
}

interface DockItem {
  id: string;
  to: string;
  labelAr: string;
  labelEn: string;
  labelFr: string;
  labelDe: string;
  labelJa: string;
  icon: React.ElementType;
  bgGradient: string;
  glow: string;
}

const DOCK_ITEMS: DockItem[] = [
  {
    id: 'astronomy',
    to: '/app/labs/astronomy',
    labelAr: 'مرصد الفلك ومدارات كبلر',
    labelEn: 'Kepler Astronomy Lab',
    labelFr: 'Astronomie & Kepler',
    labelDe: 'Astronomie & Kepler',
    labelJa: 'ケプラー天文台・惑星軌道',
    icon: Sparkles,
    bgGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
  {
    id: 'geology',
    to: '/app/labs/geology',
    labelAr: 'علوم الأرض والزلازل',
    labelEn: 'Geology & Seismic Lab',
    labelFr: 'Géologie & Séismes',
    labelDe: 'Geologie & Erdbeben',
    labelJa: '地球科学・地震シミュレータ',
    icon: Globe2,
    bgGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    glow: 'rgba(139, 92, 246, 0.5)',
  },
  {
    id: 'biology',
    to: '/app/labs/biology',
    labelAr: 'مختبر الأحياء والخلية',
    labelEn: 'Biology & Cell Lab',
    labelFr: 'Biologie & Cellule',
    labelDe: 'Biologie & Zelle',
    labelJa: '生物学・細胞実験室',
    icon: Dna,
    bgGradient: 'linear-gradient(135deg, #10b981, #059669)',
    glow: 'rgba(16, 185, 129, 0.5)',
  },
  {
    id: 'chemistry',
    to: '/app/labs/chemistry',
    labelAr: 'مختبر الكيمياء والتفاعلات',
    labelEn: 'Chemistry Reactions Lab',
    labelFr: 'Chimie & Réactions',
    labelDe: 'Chemie & Reaktionen',
    labelJa: '化学反応・元素実験室',
    icon: FlaskConical,
    bgGradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    glow: 'rgba(249, 115, 22, 0.5)',
  },
  {
    id: 'physics',
    to: '/app/labs/physics',
    labelAr: 'مختبر الفيزياء والدوائر',
    labelEn: 'Physics & Waves Lab',
    labelFr: 'Physique & Ondes',
    labelDe: 'Physik & Wellen',
    labelJa: '物理学・電気回路実験室',
    icon: Zap,
    bgGradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    glow: 'rgba(14, 165, 233, 0.5)',
  },
  {
    id: 'anatomy',
    to: '/app/labs/anatomy',
    labelAr: 'أطلس التشريح الطبي 3D',
    labelEn: '3D Anatomy Atlas',
    labelFr: 'Atlas Anatomie 3D',
    labelDe: '3D-Anatomie-Atlas',
    labelJa: '3D人体解剖学アトラス',
    icon: Activity,
    bgGradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    glow: 'rgba(244, 63, 94, 0.5)',
  },
  {
    id: 'overview',
    to: '/app',
    labelAr: 'الرئيسية · لوحة التحكم',
    labelEn: 'Dashboard Overview',
    labelFr: 'Tableau de bord',
    labelDe: 'Übersicht',
    labelJa: 'ダッシュボード・概要',
    icon: Home,
    bgGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    glow: 'rgba(59, 130, 246, 0.5)',
  },
];

export const SciNexaNavDock: React.FC<SciNexaNavDockProps> = ({ className = '' }) => {
  const { language } = useLanguage();
  const { role, educator, user } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceCommandText, setVoiceCommandText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [warningReprimand, setWarningReprimand] = useState<string | null>(null);
  const voiceContainerRef = useRef<HTMLDivElement>(null);
  const ar = language === 'ar';
  const ja = language === 'ja';

  const getLabel = (item: DockItem) => {
    switch (language) {
      case 'ja': return item.labelJa;
      case 'fr': return item.labelFr;
      case 'de': return item.labelDe;
      case 'en': return item.labelEn;
      default: return item.labelAr;
    }
  };

  const getCurrentScreenName = () => {
    const p = location.pathname;
    if (p.includes('/labs/chemistry')) return ar ? 'معمل الكيمياء والتفاعلات' : 'Chemistry Lab';
    if (p.includes('/labs/physics')) return ar ? 'معمل الفيزياء والدوائر' : 'Physics Lab';
    if (p.includes('/labs/anatomy')) return ar ? 'أطلس التشريح الطبي 3D' : 'Anatomy Atlas';
    if (p.includes('/labs/astronomy')) return ar ? 'مرصد الفلك ومدارات كبلر' : 'Astronomy Observatory';
    if (p.includes('/labs/geology')) return ar ? 'معمل علوم الأرض والزلازل' : 'Geology Lab';
    if (p.includes('/labs/biology')) return ar ? 'مختبر الأحياء والخلية' : 'Biology Lab';
    if (p.includes('/curriculum')) return ar ? 'المناهج الدراسية المقررة' : 'Curriculum';
    if (p.includes('/portal')) return ar ? 'بوابة المعلمين والإدارة' : 'Educator Portal';
    return ar ? 'الرئيسية · لوحة التحكم العامة' : 'Main Dashboard';
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = ar ? 'ar-SA' : 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const executeVoiceCommand = (cmd: string) => {
    const clean = cmd.trim().toLowerCase();
    setVoiceCommandText('');

    // 1. صلاحيات الإدارة والفصول ومحاولة الطالب تجاوز حدوده
    const isAdminOrClassCommand =
      clean.includes('فصل') ||
      clean.includes('كلاس') ||
      clean.includes('class') ||
      clean.includes('إدارة') ||
      clean.includes('معلم') ||
      clean.includes('admin') ||
      clean.includes('درجات') ||
      clean.includes('صلاحية');

    if (isAdminOrClassCommand) {
      const isEducator = role === 'teacher' || role === 'admin' || Boolean(educator);
      if (!isEducator) {
        const studentName = (localStorage.getItem('scinexa_user_fullname') || '').trim().split(/\s+/)[0] || user?.name?.trim().split(/\s+/)[0] || (ar ? 'طالب' : 'Student');
        const reprimand = ar
          ? `يا ${studentName}، أنت ممنوع تعمل كدا ومينفعش، والأمر ده مش هنفذه لأنك طالب مش معلم، وإدارة الفصول وصلاحيات المدرسة محصورة بالمعلم والمدير فقط.`
          : `Notice: You are not allowed to perform this action. I will not execute this command because you are a student, not a teacher. Class and school management is restricted to educators and administrators only.`;
        setWarningReprimand(reprimand);
        speakText(reprimand);
        return;
      } else {
        // المعلم أو الإدارة
        setWarningReprimand(null);
        speakText(ar ? 'مرحباً بك يا أستاذنا، جاري نقلك إلى لوحة إدارة الفصول المدرسية الآن...' : 'Opening Classes management...');
        setTimeout(() => {
          setIsVoiceOpen(false);
          navigate('/portal/classes');
        }, 1000);
        return;
      }
    }

    // 2. أوامر التنقل بالمعامل والمناهج مع توضيح السبب بدقة
    setWarningReprimand(null);
    if (clean.includes('كيمياء') || clean.includes('تفاعل') || clean.includes('chemistry')) {
      if (location.pathname === '/app/labs/chemistry') {
        const msg = ar ? 'لم أنقلك لأنك موجود بالفعل داخل معمل الكيمياء والتفاعلات الآن.' : 'You are already inside the Chemistry Lab.';
        speakText(msg);
        setWarningReprimand(msg);
        return;
      }
      speakText(ar ? 'حاضر، جاري نقلك إلى معمل الكيمياء والتفاعلات الآن...' : 'Launching Chemistry Lab...');
      setTimeout(() => { setIsVoiceOpen(false); navigate('/app/labs/chemistry'); }, 900);
    } else if (clean.includes('فيزياء') || clean.includes('كهربا') || clean.includes('physics')) {
      if (location.pathname === '/app/labs/physics') {
        const msg = ar ? 'لم أنقلك لأنك موجود بالفعل داخل معمل الفيزياء والدوائر.' : 'You are already inside the Physics Lab.';
        speakText(msg);
        setWarningReprimand(msg);
        return;
      }
      speakText(ar ? 'حاضر، جاري فتح معمل الفيزياء والدوائر الكهربائية...' : 'Opening Physics Lab...');
      setTimeout(() => { setIsVoiceOpen(false); navigate('/app/labs/physics'); }, 900);
    } else if (clean.includes('تشريح') || clean.includes('عظام') || clean.includes('anatomy')) {
      if (location.pathname === '/app/labs/anatomy') {
        const msg = ar ? 'لم أنقلك لأنك تتصفح بالفعل أطلس التشريح الطبي 3D الآن.' : 'You are already inside the 3D Anatomy Atlas.';
        speakText(msg);
        setWarningReprimand(msg);
        return;
      }
      speakText(ar ? 'حاضر، جاري فتح أطلس التشريح الطبي ثلاثي الأبعاد...' : 'Opening Anatomy Atlas...');
      setTimeout(() => { setIsVoiceOpen(false); navigate('/app/labs/anatomy'); }, 900);
    } else if (clean.includes('فلك') || clean.includes('كواكب') || clean.includes('نجوم') || clean.includes('astronomy')) {
      if (location.pathname === '/app/labs/astronomy') {
        const msg = ar ? 'لم أنقلك لأنك تتواجد بالفعل داخل مرصد كبلر الفلكي.' : 'You are already inside Kepler Observatory.';
        speakText(msg);
        setWarningReprimand(msg);
        return;
      }
      speakText(ar ? 'حاضر، جاري توجيه التلسكوب إلى مرصد الفلك ومدارات كبلر...' : 'Opening Kepler Observatory...');
      setTimeout(() => { setIsVoiceOpen(false); navigate('/app/labs/astronomy'); }, 900);
    } else if (clean.includes('أرض') || clean.includes('زلزال') || clean.includes('geology')) {
      if (location.pathname === '/app/labs/geology') {
        const msg = ar ? 'لم أنقلك لأنك موجود بالفعل داخل معمل علوم الأرض ورصد الزلازل.' : 'You are already inside Geology Lab.';
        speakText(msg);
        setWarningReprimand(msg);
        return;
      }
      speakText(ar ? 'حاضر، جاري فتح معمل علوم الأرض ورصد الزلازل...' : 'Opening Geology Lab...');
      setTimeout(() => { setIsVoiceOpen(false); navigate('/app/labs/geology'); }, 900);
    } else if (clean.includes('أحياء') || clean.includes('خلية') || clean.includes('biology')) {
      if (location.pathname === '/app/labs/biology') {
        const msg = ar ? 'لم أنقلك لأنك موجود بالفعل داخل مختبر الأحياء وفحص الخلية.' : 'You are already inside Biology Lab.';
        speakText(msg);
        setWarningReprimand(msg);
        return;
      }
      speakText(ar ? 'حاضر، جاري فتح مختبر الأحياء وفحص الخلية الحية...' : 'Opening Biology Lab...');
      setTimeout(() => { setIsVoiceOpen(false); navigate('/app/labs/biology'); }, 900);
    } else if (clean.includes('منهج') || clean.includes('دروس') || clean.includes('curriculum')) {
      if (location.pathname === '/app/curriculum') {
        const msg = ar ? 'لم أنقلك لأنك تتصفح بالفعل المناهج والدروس حالياً.' : 'You are already in Curriculum section.';
        speakText(msg);
        setWarningReprimand(msg);
        return;
      }
      speakText(ar ? 'حاضر، جاري فتح المناهج الدراسية والتقييمات...' : 'Opening Curriculum...');
      setTimeout(() => { setIsVoiceOpen(false); navigate('/app/curriculum'); }, 900);
    } else if (clean.includes('رئيسية') || clean.includes('لوحة') || clean.includes('home')) {
      if (location.pathname === '/app') {
        const msg = ar ? 'أنت موجود بالفعل في لوحة التحكم الرئيسية.' : 'You are already on the Overview page.';
        speakText(msg);
        setWarningReprimand(msg);
        return;
      }
      speakText(ar ? 'جاري العودة للوحة التحكم العامة...' : 'Opening Overview...');
      setTimeout(() => { setIsVoiceOpen(false); navigate('/app'); }, 900);
    } else {
      const msg = ar
        ? `لم أستطع تنفيذ أمرك "${cmd}"، والسبب أن هذا المعمل أو القسم غير موجود في المنصة. الأقسام المتاحة هي: معمل الكيمياء، الفيزياء، التشريح، الفلك، الأحياء، والجيولوجيا.`
        : `Could not execute "${cmd}" because this section does not exist on SciNexa. Available labs are: Chemistry, Physics, Anatomy, Astronomy, Biology, and Geology.`;
      speakText(msg);
      setWarningReprimand(msg);
    }
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(ar ? 'خاصية التعرف الصوتي غير مدعومة في متصفحك، يرجى كتابة الأمر.' : 'Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = ar ? 'ar-EG' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setVoiceCommandText(transcript);
          executeVoiceCommand(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Mount Fish Audio agent inside the floating overlay when opened
  useEffect(() => {
    if (!isVoiceOpen || !voiceContainerRef.current) return;

    // Load Fish Audio widget script if not already present
    if (!document.querySelector('script[src*="agent-widget-embed"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@fishaudio/agent-widget-embed@0.3.0/dist/index.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const container = voiceContainerRef.current;
    if (!container.querySelector('fish-agent')) {
      const el = document.createElement('fish-agent');
      el.setAttribute('agent-id', '929a1bf391db4185b03ae62f05a49207');
      el.setAttribute('language', ar ? 'ar' : 'en');
      el.setAttribute('text-input', 'true');
      el.setAttribute('transcript', 'true');
      el.setAttribute('agent-name', ar ? 'داروين • مرشد العلوم' : 'Darwin AI');
      el.setAttribute(
        'greeting',
        ar
          ? 'مرحباً بك! أنا داروين مرشدك العلمي الصوتي في منصة SciNexa. تحدث معي بصوتك أو اكتب وسأساعدك فوراً.'
          : 'Welcome! I am Darwin, your science AI voice guide in SciNexa. Speak or chat with me about any lab.'
      );
      el.style.width = '100%';
      el.style.minHeight = '420px';
      el.style.display = 'block';
      container.appendChild(el);
    }
  }, [isVoiceOpen, ar]);

  const handleToggleDarwin = () => {
    setIsVoiceOpen((prev) => !prev);
  };

  return (
    <>
      {/* ── FLOATING VOICE AGENT MODAL (Fish Audio) ── */}
      {isVoiceOpen && (
        <div
          role="dialog"
          aria-modal="true"
          dir={ar ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-[580px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-[#0c0e14] text-white shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-gradient-to-r from-cyan-950/60 to-transparent sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Mic size={18} strokeWidth={2.2} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-cyan-400 font-bold">
                    <Radio size={11} className="animate-pulse" />
                    <span>Fish Audio Voice Engine · داروين الموجه الصوتي</span>
                  </div>
                  <h3 className="text-[14px] font-bold text-white">
                    {ar ? 'التحكم الصوتي الشامل وتوجيه المنصة' : 'SciNexa AI Voice Controller'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Screen Awareness & Role Ribbon */}
            <div className="px-5 py-2.5 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-cyan-300">
                <Eye size={13} className="text-cyan-400" />
                <span>
                  {ar ? 'الشاشة النشطة الآن:' : 'Active Screen:'}{' '}
                  <strong className="text-white font-medium">{getCurrentScreenName()}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-white/60">
                  {ar ? 'حالة الحساب:' : 'Role:'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    role === 'student'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {role === 'student'
                    ? ar
                      ? 'طالب مسجل'
                      : 'Student'
                    : ar
                    ? 'معلم مشرف / مسؤول إدارة'
                    : 'Educator / Admin'}
                </span>
              </div>
            </div>

            {/* Strict Reprimand Alert (If student asks to manage/add classes) */}
            {warningReprimand && (
              <div className="m-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-[13px] mb-1.5">
                  <ShieldAlert size={16} />
                  <span>{ar ? 'تنبيه أخلاقي وأمني حول الصلاحيات' : 'Role Security Alert'}</span>
                </div>
                <div className="text-[12px] leading-relaxed whitespace-pre-line text-amber-100 font-medium">
                  {warningReprimand}
                </div>
                <button
                  type="button"
                  onClick={() => setWarningReprimand(null)}
                  className="mt-3 text-[11px] underline text-amber-300 hover:text-white"
                >
                  {ar ? 'فهمت ذلك، العودة للتعلم والتحصيل' : 'Understood, back to learning'}
                </button>
              </div>
            )}

            {/* Quick Action Voice Chips */}
            <div className="px-5 pt-3 pb-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/50 mb-2">
                {ar ? 'أوامر صوتية سريعة بنقرة واحدة:' : 'Quick Voice Navigation Commands:'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '🧪 معمل الكيمياء والتفاعلات', cmd: 'انقلني لمعمل الكيمياء' },
                  { label: '🫀 أطلس التشريح 3D', cmd: 'انقلني لأطلس التشريح' },
                  { label: '⚡ معمل الفيزياء والدوائر', cmd: 'انقلني للفيزياء' },
                  { label: '🪐 مرصد الفلك وكبلر', cmd: 'انقلني للفلك' },
                  { label: '📚 المناهج والدروس', cmd: 'انقلني للمناهج' },
                  { label: '🏫 إضافة فصل دراسي جديد', cmd: 'أضف فصل جديد' },
                  { label: '📊 لوحة الإدارة المدرسية', cmd: 'افتح لوحة الإدارة' },
                ].map((chip) => (
                  <button
                    key={chip.cmd}
                    type="button"
                    onClick={() => executeVoiceCommand(chip.cmd)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white text-[11px] font-medium transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Command Input Bar */}
            <div className="px-5 py-2.5 bg-black/30 border-t border-b border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (voiceCommandText.trim()) executeVoiceCommand(voiceCommandText);
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
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
                      ? ar
                        ? 'جارٍ الاستماع لصوتك الآن...'
                        : 'Listening to your voice...'
                      : ar
                      ? 'اكتب أو قل أمرك لداروين (مثال: انقلني لمعمل الكيمياء)...'
                      : 'Tell Darwin where to take you...'
                  }
                  className="flex-1 h-10 px-3 rounded-xl bg-white/5 border border-white/15 text-[12px] text-white placeholder:text-white/40 outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="h-10 px-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[12px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Send size={13} />
                  <span className="hidden sm:inline">{ar ? 'تنفيذ' : 'Execute'}</span>
                </button>
              </form>
            </div>

            {/* Standard Official Fish Audio Agent Widget Container */}
            <div className="p-4 bg-[#08090d] min-h-[440px] flex flex-col justify-center items-center border-t border-white/5">
              <div ref={voiceContainerRef} className="w-full flex justify-center" />
              <div className="mt-3 text-center text-[11px] text-white/50 flex items-center justify-center gap-2">
                <Volume2 size={13} className="text-cyan-400" />
                <span>
                  {ar
                    ? 'مودل فيش أوديو الصوتي المباشر · داروين المرشد العلمي'
                    : 'Fish Audio Real-time Voice Agent · Darwin AI'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM DOCK TASKBAR ── */}
      <aside
        aria-label="SciNexa Dock Taskbar"
        className={`fixed bottom-4 inset-x-0 z-40 flex justify-center items-end pointer-events-none px-3 ${className}`}
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))' }}
      >
        <nav
          dir="ltr"
          className="pointer-events-auto flex items-center justify-center gap-2 sm:gap-2.5 px-3 py-2.5 rounded-[24px] bg-[#141518]/95 border border-white/15 backdrop-blur-2xl shadow-[0_18px_60px_-10px_rgba(0,0,0,0.65)] transition-all duration-300"
        >
          {DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(item.to);
            const isHovered = hoveredId === item.id;
            const label = getLabel(item);

            return (
              <div key={item.id} className="relative flex flex-col items-center">
                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute bottom-full mb-3 px-3 py-1.5 rounded-xl text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                    style={{
                      background: 'rgba(15, 17, 23, 0.96)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      boxShadow: `0 8px 24px -4px ${item.glow}`,
                    }}
                  >
                    {label}
                  </div>
                )}

                {/* Squircle Button */}
                <button
                  type="button"
                  onClick={() => navigate(item.to)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  aria-label={label}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0 relative overflow-hidden"
                  style={{
                    background: item.bgGradient,
                    transform: isHovered
                      ? 'scale(1.12) translateY(-3px)'
                      : isActive
                        ? 'scale(1.05)'
                        : 'scale(1)',
                    boxShadow: isActive
                      ? `0 0 0 2.5px #ffffff, 0 8px 20px -2px ${item.glow}`
                      : isHovered
                        ? `0 6px 18px ${item.glow}`
                        : '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Icon size={19} strokeWidth={2.1} className="text-white drop-shadow" />
                </button>

                {/* Glowing Active Indicator Dot */}
                <div
                  className="mt-1 w-1.5 h-1.5 rounded-full transition-all duration-200"
                  style={{
                    background: isActive ? '#60a5fa' : 'transparent',
                    boxShadow: isActive ? '0 0 8px #60a5fa, 0 0 2px #ffffff' : 'none',
                  }}
                />
              </div>
            );
          })}

          {/* Divider */}
          <div className="h-6 w-px bg-white/15 mx-0.5 shrink-0" />

          {/* Darwin AI Voice Companion Squircle Button */}
          <div className="relative flex flex-col items-center shrink-0">
            {hoveredId === 'darwin' && (
              <div
                className="absolute bottom-full mb-3 px-3 py-1.5 rounded-xl text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  background: 'rgba(15, 17, 23, 0.96)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 24px rgba(6, 182, 212, 0.45)',
                }}
              >
                {ar ? 'داروين | وكيل الذكاء الصوتي (Fish Audio)' : 'Darwin | AI Voice Assistant'}
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleDarwin}
              onMouseEnter={() => setHoveredId('darwin')}
              onMouseLeave={() => setHoveredId(null)}
              aria-label="Darwin AI Voice Assistant"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                transform: hoveredId === 'darwin' || isVoiceOpen ? 'scale(1.12) translateY(-3px)' : 'scale(1)',
                boxShadow: isVoiceOpen ? '0 0 0 2.5px #ffffff, 0 0 25px #22d3ee' : '0 4px 16px rgba(6, 182, 212, 0.45)',
              }}
            >
              <span className="absolute inset-0 rounded-[14px] bg-cyan-300 opacity-20 animate-ping" />
              <Mic size={18} strokeWidth={2.2} className="text-white relative z-10" />
            </button>

            <div
              className="mt-1 w-1.5 h-1.5 rounded-full"
              style={{
                background: isVoiceOpen ? '#22d3ee' : '#06b6d4',
                boxShadow: isVoiceOpen ? '0 0 10px #22d3ee' : 'none',
              }}
            />
          </div>
        </nav>
      </aside>
    </>
  );
};

export default SciNexaNavDock;

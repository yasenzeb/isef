/**
 * SciNexaNavDock.tsx — شريط التنقل الكبسولي المتطور لمنصة ساينكسا
 * كبسولة زجاجية داكنة فخمة تضم المعامل الستة والأوفر فيو وزر داروين الصوتي المباشر
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
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
  Volume2
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
    icon: Home,
    bgGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    glow: 'rgba(59, 130, 246, 0.5)',
  },
];

export const SciNexaNavDock: React.FC<SciNexaNavDockProps> = ({ className = '' }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const voiceContainerRef = useRef<HTMLDivElement>(null);
  const ar = language === 'ar';

  const getLabel = (item: DockItem) => {
    switch (language) {
      case 'fr': return item.labelFr;
      case 'de': return item.labelDe;
      case 'en': return item.labelEn;
      default: return item.labelAr;
    }
  };

  // Mount Fish Audio agent inside the floating overlay when opened
  useEffect(() => {
    if (!isVoiceOpen || !voiceContainerRef.current) return;

    // Load Fish Audio widget script if not already present
    if (!document.querySelector('script[src*="agent-widget-embed"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@fishaudio/agent-widget-embed';
      script.async = true;
      document.body.appendChild(script);
    }

    const container = voiceContainerRef.current;
    if (!container.querySelector('fish-agent')) {
      const el = document.createElement('fish-agent');
      el.setAttribute('agent-id', '929a1bf391db4185b03ae62f05a49207');
      el.setAttribute('language', ar ? 'ar' : 'en');
      el.setAttribute(
        'greeting',
        ar
          ? 'أهلاً بك يا بطل! أنا داروين مرشدك العلمي الصوتي في منصة SciNexa. تحدث معي بصوتك واسألني عن أي تجربة معملية وسأجيبك فوراً.'
          : 'Welcome! I am Darwin, your science AI voice guide in SciNexa. Speak with me directly about any laboratory or experiment.'
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
          <div className="relative w-full max-w-[560px] overflow-hidden rounded-[24px] bg-[#0c0e14] text-white shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-gradient-to-r from-cyan-950/60 to-transparent">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Mic size={18} strokeWidth={2.2} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-cyan-400 font-bold">
                    <Radio size={11} className="animate-pulse" />
                    <span>Fish Audio Voice Agent · داروين</span>
                  </div>
                  <h3 className="text-[14px] font-bold text-white">
                    {ar ? 'تحدث صوتياً مع داروين • وكيل الذكاء الاصطناعي' : 'Darwin AI Voice Assistant'}
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

            {/* Fish Agent Canvas Container */}
            <div className="p-4 bg-[#08090d] min-h-[440px] flex flex-col justify-center">
              <div ref={voiceContainerRef} className="w-full flex justify-center" />
              <div className="mt-3 text-center text-[11px] text-white/50 flex items-center justify-center gap-2">
                <Volume2 size={13} className="text-cyan-400" />
                <span>
                  {ar
                    ? 'تحدث في الميكروفون بوضوح واسأل عن أي تجربة في المعامل الستة'
                    : 'Speak into your microphone to converse with Darwin about any experiment.'}
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

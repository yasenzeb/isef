/**
 * SciNexaNavDock.tsx — شريط التنقل الكبسولي والتاسك بار المتطور لمنصة ساينكسا
 * يضم المعامل الستة ووضع الفصل وزر داروين الصوتي (Fish Audio).
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 * SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f
 */

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Activity,
  Zap,
  FlaskConical,
  Dna,
  Globe2,
  Sparkles,
  Presentation,
} from 'lucide-react';

interface SciNexaNavDockProps {
  className?: string;
}

const DOCK_ITEMS = [
  {
    id: 'overview',
    to: '/app',
    labelAr: 'نظرة عامة',
    labelEn: 'Overview',
    labelFr: 'Aperçu',
    labelDe: 'Übersicht',
    icon: LayoutDashboard,
    gradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
    glow: 'rgba(30, 41, 59, 0.45)',
  },
  {
    id: 'anatomy',
    to: '/app/labs/anatomy',
    labelAr: 'أطلس التشريح 3D',
    labelEn: 'Anatomy Atlas',
    labelFr: 'Atlas Anatomie',
    labelDe: 'Anatomie-Atlas',
    icon: Activity,
    gradient: 'linear-gradient(135deg, #e11d48, #be123c)',
    glow: 'rgba(225, 29, 72, 0.45)',
  },
  {
    id: 'physics',
    to: '/app/labs/physics',
    labelAr: 'مختبر الفيزياء',
    labelEn: 'Physics Lab',
    labelFr: 'Lab Physique',
    labelDe: 'Physik-Labor',
    icon: Zap,
    gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    glow: 'rgba(37, 99, 235, 0.45)',
  },
  {
    id: 'chemistry',
    to: '/app/labs/chemistry',
    labelAr: 'مختبر الكيمياء',
    labelEn: 'Chemistry Lab',
    labelFr: 'Lab Chimie',
    labelDe: 'Chemie-Labor',
    icon: FlaskConical,
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
    glow: 'rgba(217, 119, 6, 0.45)',
  },
  {
    id: 'biology',
    to: '/app/labs/biology',
    labelAr: 'مختبر الأحياء',
    labelEn: 'Biology Lab',
    labelFr: 'Lab Biologie',
    labelDe: 'Biologie-Labor',
    icon: Dna,
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    glow: 'rgba(5, 150, 105, 0.45)',
  },
  {
    id: 'geology',
    to: '/app/labs/geology',
    labelAr: 'علوم الأرض والزلازل',
    labelEn: 'Geology & Seismic',
    labelFr: 'Géologie & Séisme',
    labelDe: 'Geologie & Erdbeben',
    icon: Globe2,
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    glow: 'rgba(124, 58, 237, 0.45)',
  },
  {
    id: 'astronomy',
    to: '/app/labs/astronomy',
    labelAr: 'علم الفلك ومدارات كبلر',
    labelEn: 'Astronomy & Kepler',
    labelFr: 'Astronomie & Kepler',
    labelDe: 'Astronomie & Kepler',
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    glow: 'rgba(2, 132, 199, 0.45)',
  },
  {
    id: 'classroom',
    to: '/app/classroom',
    labelAr: 'وضع السبورة الذكية',
    labelEn: 'Smartboard Mode',
    labelFr: 'Tableau Interactif',
    labelDe: 'Smartboard-Modus',
    icon: Presentation,
    gradient: 'linear-gradient(135deg, #0d9488, #0f766e)',
    glow: 'rgba(13, 148, 136, 0.45)',
  },
];

export const SciNexaNavDock: React.FC<SciNexaNavDockProps> = ({ className = '' }) => {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getLabel = (item: typeof DOCK_ITEMS[0]) => {
    switch (language) {
      case 'fr': return item.labelFr;
      case 'de': return item.labelDe;
      case 'en': return item.labelEn;
      default: return item.labelAr;
    }
  };

  const handleOpenDarwin = () => {
    // 1. Ensure Fish Audio script is loaded
    if (!document.querySelector('script[src*="agent-widget-embed"]')) {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/@fishaudio/agent-widget-embed';
      s.async = true;
      document.body.appendChild(s);
    }

    // 2. Inject fish-agent element if not present in DOM
    let agentEl = document.querySelector('fish-agent') as (HTMLElement & { shadowRoot?: ShadowRoot }) | null;
    if (!agentEl) {
      agentEl = document.createElement('fish-agent') as any;
      agentEl?.setAttribute('agent-id', '929a1bf391db4185b03ae62f05a49207');
      agentEl?.setAttribute('language', language === 'ar' ? 'ar' : 'en');
      agentEl?.setAttribute(
        'greeting',
        language === 'ar'
          ? 'أهلاً بك يا بطل! أنا داروين مرشدك العلمي المباشر في منصة SciNexa. اسألني عن أي معمل أو تجربة علمية!'
          : 'Welcome! I am Darwin, your live science guide in SciNexa. Ask me about any lab or experiment!'
      );
      document.body.appendChild(agentEl!);
    }

    // 3. Try to click internal trigger or navigate to assistant
    const tryClickButton = () => {
      const el = document.querySelector('fish-agent') as any;
      if (el?.shadowRoot) {
        const btn = el.shadowRoot.querySelector('button') as HTMLElement | null;
        if (btn) {
          btn.click();
          return true;
        }
      }
      return false;
    };

    if (!tryClickButton()) {
      navigate('/app/assistant');
    }
  };

  return (
    <aside
      aria-label="SciNexa Dock Taskbar"
      className={`fixed bottom-3 inset-x-0 z-40 flex justify-center items-end pointer-events-none px-3 ${className}`}
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
    >
      <nav
        dir={isRTL ? 'rtl' : 'ltr'}
        className="pointer-events-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#121215]/90 backdrop-blur-xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.35)] transition-all duration-300"
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
                  className="absolute bottom-full mb-3 px-2.5 py-1 rounded-lg text-white text-[11px] font-medium whitespace-nowrap pointer-events-none shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    background: 'rgba(15, 15, 20, 0.92)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  {label}
                </div>
              )}

              {/* Icon Squircle Button */}
              <button
                type="button"
                onClick={() => navigate(item.to)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                aria-label={label}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0"
                style={{
                  background: item.gradient,
                  transform: isHovered
                    ? 'scale(1.15) translateY(-3px)'
                    : isActive
                      ? 'scale(1.06)'
                      : 'scale(1)',
                  boxShadow: isActive
                    ? `0 0 0 2px rgba(255, 255, 255, 0.9), 0 4px 14px ${item.glow}`
                    : isHovered
                      ? `0 4px 14px ${item.glow}`
                      : '0 2px 6px rgba(0, 0, 0, 0.15)',
                }}
              >
                <Icon size={17} strokeWidth={2} className="text-white drop-shadow-sm" />
              </button>

              {/* Active Indicator Dot */}
              <div
                className="mt-1 w-1 h-1 rounded-full transition-all duration-200"
                style={{
                  background: isActive ? '#0a0a0a' : 'transparent',
                  boxShadow: isActive ? '0 0 4px rgba(0, 0, 0, 0.5)' : 'none',
                }}
              />
            </div>
          );
        })}

        {/* Frosted Divider */}
        <div className="h-6 w-px bg-black/10 dark:bg-white/15 mx-0.5 sm:mx-1 shrink-0" />

        {/* Darwin Voice Assistant Button (Fish Audio) */}
        <div className="relative flex flex-col items-center shrink-0">
          {hoveredId === 'darwin' && (
            <div
              className="absolute bottom-full mb-3 px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                background: 'rgba(15, 15, 20, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
              }}
            >
              {language === 'ar' ? 'داروين | وكيل Fish Audio الصوتي' : 'Darwin | Fish Audio AI Voice'}
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenDarwin}
            onMouseEnter={() => setHoveredId('darwin')}
            onMouseLeave={() => setHoveredId(null)}
            aria-label="Darwin AI Voice Assistant"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0 group relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
              transform: hoveredId === 'darwin' ? 'scale(1.15) translateY(-3px)' : 'scale(1)',
              boxShadow: '0 4px 16px rgba(29, 78, 216, 0.45)',
            }}
          >
            {/* Pulsing soundwave animation */}
            <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-ping" />
            <svg
              className="w-4 h-4 text-white relative z-10 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="3.5" y="9" width="2" height="6" rx="1" />
              <rect x="7.5" y="6" width="2" height="12" rx="1" />
              <rect x="11.5" y="3.5" width="2" height="17" rx="1" />
              <rect x="15.5" y="6" width="2" height="12" rx="1" />
              <rect x="19.5" y="9" width="2" height="6" rx="1" />
            </svg>
          </button>

          <div className="mt-1 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" />
        </div>
      </nav>
    </aside>
  );
};

export default SciNexaNavDock;

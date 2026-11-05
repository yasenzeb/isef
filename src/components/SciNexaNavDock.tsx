/**
 * SciNexaNavDock.tsx — شريط التنقل الكبسولي المتطور لمنصة ساينكسا
 * تصميم مطابق بدقة لكبسولة التاسك بار (Image 3):
 * كبسولة زجاجية داكنة فخمة تضم المعامل الستة والأوفر فيو وزر داروين الصوتي.
 *
 * © Islam & Yaseen — SciNexa ISEF 2026
 */

import React, { useState } from 'react';
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

// Ordered exactly as shown in Image 3
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
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getLabel = (item: DockItem) => {
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
          ? 'أهلاً بك! أنا داروين مرشدك العلمي المباشر في منصة SciNexa. اسألني عن أي معمل أو تجربة علمية!'
          : 'Welcome! I am Darwin, your science AI voice guide. Ask me about any lab or experiment!'
      );
      document.body.appendChild(agentEl!);
    }

    // 3. Try to click internal button or navigate to assistant
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

              {/* Squircle Button matching Image 3 */}
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

              {/* Glowing Active Indicator Dot matching Image 3 */}
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
              {language === 'ar' ? 'داروين | وكيل الذكاء الصوتي (Fish Audio)' : 'Darwin | AI Voice Assistant'}
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenDarwin}
            onMouseEnter={() => setHoveredId('darwin')}
            onMouseLeave={() => setHoveredId(null)}
            aria-label="Darwin AI Voice Assistant"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              transform: hoveredId === 'darwin' ? 'scale(1.12) translateY(-3px)' : 'scale(1)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.45)',
            }}
          >
            {/* Pulsing soundwave ping */}
            <span className="absolute inset-0 rounded-[14px] bg-cyan-300 opacity-20 animate-ping" />
            <Mic size={18} strokeWidth={2.2} className="text-white relative z-10" />
          </button>

          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        </div>
      </nav>
    </aside>
  );
};

export default SciNexaNavDock;
